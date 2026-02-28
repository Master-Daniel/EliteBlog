import React from 'react';
import { Link } from 'react-router-dom';
import { Author } from '../hooks/useAuthors';

interface AuthorCardProps {
    author: Author;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
    return (
        <div className="text-center">
            <Link to={`/author/${author.id}`}>
                <div 
                    className="rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 inline-block leading-[0] mx-auto"
                    style={{ width: '180px', height: '180px' }}
                >
                    <div className="pt-[100%] relative">
                        <img
                            alt={`${author.name}'s avatar`}
                            sizes="180px"
                            src={author.avatarUrl || '/images/default-avatar.jpg'}
                            decoding="async"
                            loading="lazy"
                            className="absolute h-full w-full left-0 top-0 right-0 bottom-0 object-cover"
                        />
                    </div>
                </div>
            </Link>
            <h3 className="text-2xl my-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Link to={`/author/${author.id}`}>{author.name}</Link>
            </h3>
            <div className="text-gray-600 dark:text-gray-400">
                {author.postCount} {author.postCount === 1 ? 'Post' : 'Posts'}
            </div>
        </div>
    );
};

export default AuthorCard;
