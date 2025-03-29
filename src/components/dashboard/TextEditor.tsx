/* eslint-disable @typescript-eslint/no-explicit-any */
import { useImperativeHandle, forwardRef, useRef } from "react";
import { Editor } from "../../vendor/tinymce/tinymce-react";

// Type for fetchEventSource (you can improve this with proper types if available)
type FetchEventSource = (url: string, options: unknown) => Promise<Response>;

const fetchApi: Promise<FetchEventSource> = import(
    "https://unpkg.com/@microsoft/fetch-event-source@2.0.1/lib/esm/index.js"
).then((module) => module.fetchEventSource);

const openai_api_key: string = import.meta.env.VITE_OPEN_AI_KEY as string;

interface TextEditorProps {
    onChange: (content: string) => void;
}

const TextEditor = forwardRef(({ onChange }: TextEditorProps, ref) => {
    const editorRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
        reset: () => {
            if (editorRef.current) {
                editorRef.current.setContent("");
            }
        },
        getContent: () => {
            return editorRef.current?.getContent() || "";
        },
    }));

    return (
        <Editor
            onInit={(_, editor) => (editorRef.current = editor)}
            onEditorChange={() => {
                if (editorRef.current) {
                    onChange(editorRef.current.getContent())
                }
            }}
            initialValue="<p>Start creating something amazing...</p>"
            init={{
                height: 500,
                plugins:
                    'importword exportword exportpdf ai preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link math media mediaembed codesample table charmap pagebreak nonbreaking anchor tableofcontents insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker editimage help formatpainter permanentpen pageembed charmap quickbars linkchecker emoticons advtable footnotes mergetags autocorrect typography advtemplate markdown', // tinycomments mentions revisionhistory
                mobile: {
                    plugins:
                        'ai preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link math media mediaembed codesample table charmap pagebreak nonbreaking anchor tableofcontents insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker help formatpainter pageembed charmap mentions quickbars linkchecker emoticons advtable footnotes mergetags autocorrect typography advtemplate',
                },
                // menu: {
                //     tc: {
                //         title: 'Comments',
                //         items: 'addcomment showcomments deleteallconversations',
                //     },
                // },
                // Type parameters for ai_request are set to any here; you can define more specific types if available
                ai_request: (request: any, respondWith: any) => {
                    respondWith.stream((signal: AbortSignal, streamMessage: (msg: string) => void) => {
                        // Adds each previous query and response as individual messages
                        const conversation = request.thread.flatMap((event: any) => {
                            if (event.response) {
                                return [
                                    { role: "user", content: event.request.query },
                                    { role: "assistant", content: event.response.data },
                                ];
                            } else {
                                return [];
                            }
                        });

                        // System messages provided by the plugin to format the output as HTML content.
                        const systemMessages = request.system.map((content: string) => ({
                            role: "system",
                            content,
                        }));

                        // Forms the new query sent to the API
                        const content =
                            request.context.length === 0 || conversation.length > 0
                                ? request.query
                                : `Question: ${request.query} Context: """${request.context}"""`;

                        const messages = [
                            ...conversation,
                            ...systemMessages,
                            { role: "user", content },
                        ];

                        let hasHead = false;
                        let markdownHead = "";

                        const hasMarkdown = (message: string): boolean => {
                            if (message.includes("`") && markdownHead !== "```") {
                                const numBackticks = message.split("`").length - 1;
                                markdownHead += "`".repeat(numBackticks);
                                if (hasHead && markdownHead === "```") {
                                    markdownHead = "";
                                    hasHead = false;
                                }
                                return true;
                            } else if (message.includes("html") && markdownHead === "```") {
                                markdownHead = "";
                                hasHead = true;
                                return true;
                            }
                            return false;
                        };

                        // Send the new query to the API
                        const requestBody = {
                            model: "gpt-4o",
                            temperature: 0.7,
                            max_tokens: 4000,
                            messages,
                            stream: true,
                        };

                        const openAiOptions = {
                            signal,
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${openai_api_key}`,
                            },
                            body: JSON.stringify(requestBody),
                        };

                        const onopen = async (response: Response): Promise<void> => {
                            if (response) {
                                const contentType = response.headers.get("content-type");
                                if (response.ok && contentType?.includes("text/event-stream")) {
                                    return;
                                } else if (contentType?.includes("application/json")) {
                                    const data = await response.json();
                                    if (data.error) {
                                        throw new Error(`${data.error.type}: ${data.error.message}`);
                                    }
                                }
                            } else {
                                throw new Error("Failed to communicate with the ChatGPT API");
                            }
                        };

                        const onmessage = (ev: MessageEvent): void => {
                            const data = ev.data;
                            if (data !== "[DONE]") {
                                const parsedData = JSON.parse(data);
                                const firstChoice = parsedData?.choices[0];
                                const message = firstChoice?.delta?.content;
                                if (message && message !== "") {
                                    if (!hasMarkdown(message)) {
                                        streamMessage(message);
                                    }
                                }
                            }
                        };

                        const onerror = (error: unknown): never => {
                            // Stop operation and do not retry by the fetch-event-source
                            throw error;
                        };

                        // Use Microsoft's fetch-event-source library to work around the 2000 character limit
                        return fetchApi
                            .then((fetchEventSource) =>
                                fetchEventSource("https://api.openai.com/v1/chat/completions", {
                                    ...openAiOptions,
                                    openWhenHidden: true,
                                    onopen,
                                    onmessage,
                                    onerror,
                                })
                            )
                            .then(async (response: Response) => {
                                if (response && !response.ok) {
                                    const data = await response.json();
                                    if (data.error) {
                                        throw new Error(`${data.error.type}: ${data.error.message}`);
                                    }
                                }
                            })
                            .catch(onerror);
                    });
                },
                quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                skin: 'oxide-dark',
                autocorrect_capitalize: true,
                toolbar_mode: 'sliding',
                contextmenu: 'link image editimage table configurepermanentpen',
                menubar: 'file edit view insert format tools table tc help',
                toolbar:
                    "undo redo | importword exportword exportpdf | revisionhistory | aidialog aishortcuts | blocks fontsizeinput | bold italic | align numlist bullist | link image | table math media pageembed | lineheight  outdent indent | strikethrough forecolor backcolor formatpainter removeformat | charmap emoticons checklist | code fullscreen preview | save print | pagebreak anchor codesample footnotes mergetags | addtemplate inserttemplate | ltr rtl casechange | spellcheckdialog a11ycheck", // addcomment showcomments
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                // images_upload_handler: handleImageUpload // Uncomment if image upload handler is provided
            }}
        />
    );
});

export default TextEditor;
