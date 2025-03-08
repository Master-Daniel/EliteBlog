import React from 'react'
import { Link } from 'react-router-dom'

const FeaturedSection: React.FC = () => {
    return (
        <div className="flex flex-wrap xl:flex-nowrap gap-10 ">
            <div className="basis-full xl:basis-[65%] shrink-0">
                <Link className="block " to="">
                    <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5 ">
                        <img alt="Post thumbnail" sizes="(max-width: 1279px) 95vw, 950px" srcSet="" src="" decoding="async" data-nimg="fill" loading="lazy" style={{ position: 'absolute', height: '100%', width: '100%', left: '0', top: '0', right: '0', bottom: '0', objectFit: 'cover', color: 'transparent' }} />
                    </div>
                </Link>
                <div className="flex flex-wrap gap-3 items-center mt-8">
                    <div className="flex flex-wrap gap-3">
                        <Link className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black tracking-wide whitespace-nowrap" to="category/inspirational.html">inspirational</Link>
                    </div>
                    <div className="text-sm data-color flex items-center ">
                        <span className="whitespace-nowrap ">Jul 8, 2022</span>
                        <span className="px-2.5">⋅</span>
                        <span className="whitespace-nowrap">5 min read</span>
                    </div>
                </div>
                <h2 className="font-bold leading-snug mt-4 text-2xl sm:text-4xl">
                    <Link to="">The only limit to our realization of tomorrow will be our doubts of today</Link>
                </h2>
                <p className="mt-4 sm:text-lg">Nostrud proident cupidatat quis commodo aliquip aliqua dolor exercitation mollit aliquip aliquip exercitation anim enim laboris reprehenderit excepteur anim. Et ea sunt laboris ullamco duis sit sit eu qui ut duis consectetur fugiat ullamco ex incididunt.</p>
                <div className="flex gap-2 items-center mt-6">
                    <div className="flex">
                        <Link className="flex -ml-3 first:ml-0 first:z-10 hover:z-20 " to="author/main.html">
                            <div className="rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 inline-block leading-[0] !border-2" style={{ width: '30px', height: '30px' }}>
                                <div className="pt-[100%] relative">
                                    <img alt="author avatar" sizes="30px" srcSet="" src="" decoding="async" data-nimg="fill" loading="lazy" style={{ position: 'absolute', height: '100%', width: '100%', left: '0', top: '0', right: '0', bottom: '0', objectFit: 'cover', color: 'transparent' }} />
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div>
                        <Link className="text-sm font-medium heading-color" to="author/main.html">Keith Brandie</Link>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row xl:flex-col gap-10 ">
                <div className="flex-1">
                    <Link className="block " to="blog/chinese-art-in-the-modern-world.html">
                        <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5 ">
                            <img alt="Post thumbnail" sizes="(max-width: 767px) 95vw, (max-width: 1279px) 40vw, 450px" srcSet="" src="" decoding="async" data-nimg="fill" loading="lazy" style={{ position: 'absolute', height: '100%', width: '100%', left: '0', top: '0', right: '0', bottom: '0', objectFit: 'cover', color: 'transparent' }} />
                        </div>
                    </Link>
                    <div className="flex flex-wrap gap-3 items-center mt-6">
                        <div className="flex flex-wrap gap-3"><Link className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black tracking-wide whitespace-nowrap" to="category/life%20lessons.html">life lessons</Link></div>
                        <div className="text-sm data-color flex items-center "><span className="whitespace-nowrap ">Apr 29, 2022</span><span className="px-2.5">⋅</span><span className="whitespace-nowrap">4 min read</span></div>
                    </div>
                    <h2 className="font-bold leading-snug mt-3 text-2xl">
                        <Link to="blog/chinese-art-in-the-modern-world.html">Chinese art in the modern world</Link>
                    </h2>
                    <p className="mt-3">Enim eu laborum ex reprehenderit quis sit velit consectetur quis ipsum nisi laboris magna irure in.</p>
                </div>
                <div className="flex-1">
                    <Link className="block " to="">
                        <div className="block relative pt-[75%] bg-black/5 dark:bg-white/5 ">
                        <img alt="Post thumbnail" sizes="(max-width: 767px) 95vw, (max-width: 1279px) 40vw, 450px" srcSet="" src="" decoding="async" data-nimg="fill" loading="lazy" style={{ position: 'absolute', height: '100%', width: '100%', left: '0', top: '0', right: '0', bottom: '0', objectFit: 'cover', color: 'transparent' }} /></div>
                    </Link>
                    <div className="flex flex-wrap gap-3 items-center mt-6">
                        <div className="flex flex-wrap gap-3">
                            <Link className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black tracking-wide whitespace-nowrap" to="category/productivity.html">productivity</Link></div>
                        <div className="text-sm data-color flex items-center">
                            <span className="whitespace-nowrap ">Apr 21, 2022</span>
                            <span className="px-2.5">⋅</span>
                            <span className="whitespace-nowrap">3 min read</span>
                        </div>
                    </div>
                    <h2 className="font-bold leading-snug mt-3 text-2xl">
                        <Link to="">Imagination governs the world</Link>
                    </h2>
                    <p className="mt-3">Ipsum est deserunt excepteur ad adipisicing anim mollit deserunt veniam aliqua duis Lorem irure enim labore et excepteur.</p>
                </div>
            </div>
        </div>
    )
}

export default FeaturedSection