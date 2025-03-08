import React from 'react';
import { Link } from 'react-router-dom';

interface Author {
    name: string;
    profileImage?: string;
    postCount?: number;
    slug?: string;
}

interface AuthorCardProps {
    author: Author;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
    return (
        <div className="text-center">
            <Link to={`/author/${author.name || 'default-slug'}`}>
                <div className="rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 inline-block leading-[0] author-card-image-container">
                    <div className="pt-[100%] relative">
                        <img
                            alt={`${author.name}'s avatar`}
                            sizes="180px"
                            srcSet={author.profileImage || '/images/default-avatar.jpg'}
                            src={author.profileImage || '/images/default-avatar.jpg'}
                            decoding="async"
                            data-nimg="fill"
                            loading="lazy"
                            className="author-card-image-wrapper"
                        />
                    </div>
                </div>
            </Link>
            <h3 className="text-2xl my-2">
                <Link to={`/author/${author.slug || 'default-slug'}`}>{author.name}</Link>
            </h3>
            <div>{author.postCount ?? 0} {author.postCount === 1 ? 'Post' : 'Posts'}</div>
        </div>
    );
};

export default AuthorCard;
