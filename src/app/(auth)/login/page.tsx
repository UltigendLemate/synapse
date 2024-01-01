'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSchema } from '@/lib/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Loader from '@/components/global/Loader';
import { actionLoginUser } from '@/lib/server-actions/auth-actions';

const LoginPage = () => {
    const router = useRouter();
    const [submitError, setsubmitError] = useState('');

    const form = useForm<z.infer<typeof FormSchema>>({
        mode: 'onChange',
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });


    const isLoading = form.formState.isSubmitting;
    const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (formData) => {

        const { error } = await actionLoginUser(formData);
        if (error) {
            form.reset();
            setsubmitError(error.message);
            return;
        }

        router.replace('/dashboard');
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
                onChange={() => { if (submitError) setsubmitError('') }}
                className=' w-full space-y-6 sm:justify-center sm:w-[400px] flex flex-col '>
                <Link href='/' className='w-full flex justify-start items-center'>
                    <h3 className='text-4xl p-3 dark:text-white font-semibold'>noshun</h3>

                </Link>

                <FormDescription className='text-foreground/60'>All-in-One Collaboration and Productivity Platform</FormDescription>

                <FormField disabled={isLoading}
                    control={form.control}
                    name='email'
                    render={({ field }) => (

                        <FormItem>
                            <FormControl>
                                <Input type='email' placeholder='Email' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                >

                </FormField>

                <FormField disabled={isLoading}
                    control={form.control}
                    name='password'
                    render={({ field }) => (

                        <FormItem>
                            <FormControl>
                                <Input type='password' placeholder='Password' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                >

                </FormField>

                {submitError && <FormMessage>{submitError}</FormMessage>}
                <Button type="submit" size="lg" disabled={isLoading} className="w-full p-6">
                    {!isLoading ? 'Login' : <Loader />}
                </Button>

                <span className='self-center'>Dont have an account?  {" "}
                    <Link href={'/signup'} className='text-primary'>Sign Up</Link>
                </span>



            </form>
        </Form>
    )
}

export default LoginPage