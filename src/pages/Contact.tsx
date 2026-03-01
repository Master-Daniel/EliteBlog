import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import Header from '../components/Header'
import NewsLetterSection from '../components/NewsLetterSection'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { PageMeta } from '../components/Meta'
import axiosInstance from '../api/axiosConfig'
import toast from 'react-hot-toast'

interface SiteSettings {
    supportEmail?: string;
    phone?: string;
    twitterUrl?: string;
    youtubeUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
}

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })

    const { data: settings } = useQuery<SiteSettings>({
        queryKey: ['public-settings'],
        queryFn: async () => {
            const response = await axiosInstance.get('/settings/public')
            return response.data
        }
    })

    const contactMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await axiosInstance.post('/contact', data)
            return response.data
        },
        onSuccess: () => {
            toast.success('Your message has been sent successfully!')
            setFormData({ name: '', email: '', message: '' })
        },
        onError: () => {
            toast.error('Failed to send message. Please try again.')
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            toast.error('Please fill in all fields')
            return
        }
        contactMutation.mutate(formData)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name.replace('contact-', '')]: e.target.value
        }))
    }

    return (
        <>
            <PageMeta
                title="Contact Us"
                description="Get in touch with EliteBlog. Share your ideas, questions, and feedback. We value your voice and are here to help."
            />
            <Header />
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 mb-8 mt-20 text-black dark:text-white">
                <div className="mb-24 text-center max-w-screen-sm mx-auto">
                    <h2 className="text-3xl sm:text-5xl capitalize">Get in Touch</h2>
                    <p className="mt-4 text-lg">EliteBlog values your voice. Share your ideas and questions to spark creativity and strengthen our vibrant community. Connect with us now to drive innovation together.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-24">
                    <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
                        <label className="sr-only" htmlFor="contact-name">contact-name</label>
                        <input 
                            className="w-full txtInputBasics h-16" 
                            id="contact-name" 
                            name="contact-name" 
                            placeholder="Name" 
                            autoComplete="off" 
                            autoCapitalize="off" 
                            spellCheck="false" 
                            type="text" 
                            pattern="(([a-zA-Z]+( )?)+)" 
                            title="Name should consist of alphabets (a to z, A to Z) and single spaces." 
                            maxLength={32} 
                            minLength={4}
                            value={formData.name}
                            onChange={handleChange}
                            disabled={contactMutation.isPending}
                        />
                        <label className="sr-only" htmlFor="contact-email">contact-email</label>
                        <input 
                            className="w-full txtInputBasics h-16" 
                            id="contact-email" 
                            name="contact-email" 
                            placeholder="Email" 
                            autoComplete="off" 
                            autoCapitalize="off" 
                            spellCheck="false" 
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={contactMutation.isPending}
                        />
                        <label className="sr-only" htmlFor="message">message</label>
                        <textarea 
                            className="txtInputBasics !rounded-3xl !h-auto" 
                            id="message" 
                            name="message" 
                            rows={6} 
                            placeholder="Message" 
                            minLength={10}
                            value={formData.message}
                            onChange={handleChange}
                            disabled={contactMutation.isPending}
                        ></textarea>
                        <button 
                            className="w-full h-16 px-8 rounded-full font-semibold cursor-pointer bg-black !text-white dark:bg-white dark:!text-black hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" 
                            type="submit"
                            disabled={contactMutation.isPending}
                        >
                            {contactMutation.isPending ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                    <div>
                        <h3 className="text-2xl mb-6">Contact Info</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex gap-3 items-center">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 110.8V792H136V270.8l-27.6-21.5 39.3-50.5 42.8 33.3h643.1l42.8-33.3 39.3 50.5-27.7 21.5zM833.6 232L512 482 190.4 232l-42.8-33.3-39.3 50.5 27.6 21.5 341.6 265.6a55.99 55.99 0 0 0 68.7 0L888 270.8l27.6-21.5-39.3-50.5-42.7 33.2z"></path>
                                </svg>
                                <Link to={`mailto:${settings?.supportEmail || 'support@eliteblog.com'}`}>
                                    {settings?.supportEmail || 'support@eliteblog.com'}
                                </Link>
                            </div>
                            {settings?.phone && (
                                <div className="flex gap-3 items-center">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M877.1 238.7L770.6 132.3c-13-13-30.4-20.3-48.8-20.3s-35.8 7.2-48.8 20.3L558.3 246.8c-13 13-20.3 30.5-20.3 48.9 0 18.5 7.2 35.8 20.3 48.9l89.6 89.7a405.46 405.46 0 0 1-86.4 127.3c-36.7 36.9-79.6 66-127.2 86.6l-89.6-89.7c-13-13-30.4-20.3-48.8-20.3a68.2 68.2 0 0 0-48.8 20.3L132.3 673c-13 13-20.3 30.5-20.3 48.9 0 18.5 7.2 35.8 20.3 48.9l106.4 106.4c22.2 22.2 52.8 34.9 84.2 34.9 6.5 0 12.8-.5 19.2-1.6 132.4-21.8 263.8-92.3 369.9-198.3C818 606 888.4 474.6 910.4 342.1c6.3-37.6-6.3-76.3-33.3-103.4zm-37.6 91.5c-19.5 117.9-82.9 235.5-178.4 331s-213 158.9-330.9 178.4c-14.8 2.5-30-2.5-40.8-13.2L184.9 721.9 295.7 611l119.8 120 .9.9 21.6-8a481.29 481.29 0 0 0 285.7-285.8l8-21.6-120.8-120.7 110.8-110.9 104.5 104.5c10.8 10.8 15.8 26 13.3 40.8z"></path>
                                    </svg>
                                    <Link to={`tel:${settings.phone}`}>{settings.phone}</Link>
                                </div>
                            )}
                        </div>
                        <h3 className="text-2xl mb-6 mt-12">Socials</h3>
                        <div className="flex gap-5 text-xl heading-color">
                            {settings?.twitterUrl && (
                                <Link to={settings.twitterUrl} aria-label="Twitter link" target="_blank" rel="noreferrer">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                                    </svg>
                                </Link>
                            )}
                            {settings?.youtubeUrl && (
                                <Link to={settings.youtubeUrl} aria-label="Youtube link" target="_blank" rel="noreferrer">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
                                    </svg>
                                </Link>
                            )}
                            {settings?.linkedinUrl && (
                                <Link to={settings.linkedinUrl} aria-label="LinkedIn link" target="_blank" rel="noreferrer">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path>
                                    </svg>
                                </Link>
                            )}
                            {settings?.githubUrl && (
                                <Link to={settings.githubUrl} aria-label="Github link" target="_blank" rel="noreferrer">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
                                    </svg>
                                </Link>
                            )}
                            {settings?.facebookUrl && (
                                <Link to={settings.facebookUrl} aria-label="Facebook link" target="_blank" rel="noreferrer">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path>
                                    </svg>
                                </Link>
                            )}
                            {settings?.instagramUrl && (
                                <Link to={settings.instagramUrl} aria-label="Instagram link" target="_blank" rel="noreferrer">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                                    </svg>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <NewsLetterSection />
            <Footer />
        </>
    )
}

export default Contact
