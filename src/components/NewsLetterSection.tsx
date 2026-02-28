import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import axiosInstance from '../api/axiosConfig'
import toast from 'react-hot-toast'

const NewsLetterSection: React.FC = () => {
    const [email, setEmail] = useState('')

    const subscribeMutation = useMutation({
        mutationFn: async (email: string) => {
            const response = await axiosInstance.post('/newsletter/subscribe', { email })
            return response.data
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Successfully subscribed!')
            setEmail('')
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            const message = error.response?.data?.message || 'Failed to subscribe. Please try again.'
            toast.error(message)
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) {
            toast.error('Please enter your email address')
            return
        }
        subscribeMutation.mutate(email)
    }

    return (
        <div className="max-w-[1480px] mx-auto px-5 sm:px-8 text-center lg:text-left lg:flex lg:gap-20 text-black dark:text-white xl:gap-36 items-center mt-36">
            <div className="flex-grow mb-12 lg:mb-0">
                <h2 className="text-4xl mb-4">Subscribe to our newsletter</h2>
                <p className="mb-8">Get all the latest posts delivered straight to your inbox.</p>
            </div>
            <div>
                <form 
                    onSubmit={handleSubmit}
                    className="flex flex-wrap sm:flex-nowrap gap-y-4 gap-x-2 sm:gap-x-0 bg-transparent sm:bg-gray-100 sm:dark:bg-white/10 sm:rounded-full lg:min-w-[450px] max-w-[500px] mx-auto"
                >
                    <label className="sr-only" htmlFor="newsletter-email">email</label>
                    <input 
                        className="w-full flex-basis-[300px] h-16 border-none flex-grow rounded-full sm:bg-transparent px-6 bg-gray-100 dark:bg-white/10 sm:dark:bg-transparent no-outline" 
                        id="newsletter-email" 
                        name="email" 
                        placeholder="Your email address" 
                        autoComplete="email" 
                        autoCapitalize="off" 
                        spellCheck="false" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={subscribeMutation.isPending}
                    />
                    <button 
                        className="btn cursor-pointer relative flex-grow sm:flex-grow-0 text-white dark:text-black bg-black dark:bg-white disabled:opacity-50 disabled:cursor-not-allowed" 
                        type="submit"
                        disabled={subscribeMutation.isPending}
                    >
                        {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default NewsLetterSection