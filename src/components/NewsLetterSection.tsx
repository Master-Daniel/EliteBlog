import React from 'react'

const NewsLetterSection: React.FC = () => {
    return (
        <div className="max-w-[1480px] mx-auto px-5 sm:px-8 text-center lg:text-left lg:flex lg:gap-20  xl:gap-36 items-center mt-36">
            <div className="flex-grow mb-12 lg:mb-0">
                <h2 className="text-4xl mb-4">Subscribe to our newsletter</h2>
                <p className=" mb-8">Get all the latest posts delivered straight to your inbox. </p>
            </div>
            <div>
                <form className="flex flex-wrap sm:flex-nowrap gap-y-4 gap-x-2 sm:gap-x-0 bg-transparent sm:bg-gray-100 sm:dark:bg-white/10 sm:rounded-full lg:min-w-[450px] max-w-[500px] mx-auto">
                    <label className="sr-only" htmlFor="email">email</label>
                    <input className="w-full flex-basis-[300px] h-16 border-none flex-grow rounded-full sm:bg-transparent px-6 bg-gray-100 dark:bg-white/10 sm:dark:bg-transparent no-outline" id="email" name="email" placeholder="Your email address" autoComplete="off" autoCapitalize="off" spellCheck="false" type="email" />
                    <button className="btn relative flex-grow sm:flex-grow-0" type="submit">
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
    )
}

export default NewsLetterSection