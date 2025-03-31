import React from "react";

interface DisqusCommentProps { title: string, slug: string, description: string }

const DisqusComments: React.FC<DisqusCommentProps> = ({ title, slug, description }) => {
    const _slug = encodeURIComponent(slug || "default-slug");
    const url = `https://blog.elitecodec.com.ng/feed/${slug}`;
    const disqusSrc = `https://disqus.com/embed/comments/?base=default&f=vince-theme&t_i=${_slug}&t_u=${encodeURIComponent(
        url
    )}&t_e=${encodeURIComponent(title)}&t_d=${encodeURIComponent(description)}&t_t=${encodeURIComponent(title)}&s_o=popular#version=e0c4832edb67a23a7ccc1138f7876e1c`;

    return (
        <div className="mt-28">
            <div id="disqus_thread" style={{ colorScheme: "none" }}>
                <iframe
                    id="dsq-app4670"
                    name="dsq-app4670"
                    allowTransparency={true}
                    tabIndex={0}
                    title="Disqus"
                    width="100%"
                    src={disqusSrc}
                    className="disqus-frame"
                ></iframe>
            </div>
        </div>
    );
};

export default DisqusComments;
