/* eslint-disable @typescript-eslint/no-explicit-any */
import { useImperativeHandle, forwardRef, useRef } from "react";
import { Editor } from "../../vendor/tinymce/tinymce-react";
import { fetchEventSource, EventSourceMessage } from "@microsoft/fetch-event-source";
import axiosInstance from "../../api/axiosConfig";

const fetchApi = Promise.resolve(fetchEventSource);

const openai_api_key: string = import.meta.env.VITE_OPEN_AI_KEY as string;
const apiUrl: string = import.meta.env.VITE_API_URL as string;

interface TextEditorProps {
    onChange: (content: string) => void;
    initialContent?: string;
}

const baseUrl = import.meta.env.VITE_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "");

const TextEditor = forwardRef(({ onChange, initialContent }: TextEditorProps, ref) => {
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
        setContent: (content: string) => {
            if (editorRef.current) {
                editorRef.current.setContent(content);
            }
        },
    }));

    const handleImageUpload = (blobInfo: any): Promise<string> => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("image", blobInfo.blob(), blobInfo.filename());

            axiosInstance
                .post("/upload/image", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => {
                    const imageUrl = `${apiUrl}/uploads/content/${response.data.filename}`;
                    resolve(imageUrl);
                })
                .catch((error) => {
                    console.error("Image upload failed:", error);
                    reject("Image upload failed: " + (error.response?.data?.message || error.message));
                });
        });
    };

    return (
        <div className="tinymce-editor-wrapper" style={{ minHeight: 520 }}>
            <Editor
                tinymceScriptSrc="/tinymce.min.js"
                onInit={(_, editor) => (editorRef.current = editor)}
                onEditorChange={() => {
                if (editorRef.current) {
                    onChange(editorRef.current.getContent())
                }
            }}
            initialValue={initialContent || "<p>Start creating something amazing...</p>"}
            init={{
                base_url: baseUrl || (typeof window !== "undefined" ? window.location.origin : ""),
                skin: "silver",
                skin_url: "/themes/silver",
                icons: "default",
                icons_url: "/icons/default/icons.min.js",
                height: 500,
                plugins:
                    'importword exportword exportpdf ai preview powerpaste casechange importcss searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link math media mediaembed codesample table charmap pagebreak nonbreaking anchor tableofcontents insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker editimage help formatpainter permanentpen pageembed charmap quickbars linkchecker emoticons advtable footnotes mergetags autocorrect typography advtemplate markdown',
                mobile: {
                    plugins:
                        'ai preview powerpaste casechange importcss searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link math media mediaembed codesample table charmap pagebreak nonbreaking anchor tableofcontents insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker help formatpainter pageembed charmap mentions quickbars linkchecker emoticons advtable footnotes mergetags autocorrect typography advtemplate',
                },
                images_upload_handler: handleImageUpload,
                automatic_uploads: true,
                file_picker_types: 'image',
                images_reuse_filename: true,
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

                        const onmessage = (ev: EventSourceMessage): void => {
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
                                    onmessage, // Fixed type
                                    onerror,
                                })
                            )
                            .catch(onerror); // Ensure errors are caught
                    });
                },
                quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
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
        </div>
    );
});

export default TextEditor;
