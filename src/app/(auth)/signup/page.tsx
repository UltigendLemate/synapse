"use client";
import Loader from '@/components/global/Loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { actionSignUpUser } from '@/lib/server-actions/auth-actions';
import { FormSchema } from '@/lib/types';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod'

const SignUpFormSchema = z.object({
    email: z.string().describe('Email').email({ message: "Invalid Email" }),

    password: z.string().describe('Password').min(6, { message: "Password must be at least 6 characters long" }),

    confirmPassword: z.string().describe('Confirm Password').min(6, { message: "Password must be at least 6 characters long" }),
}).refine((data) => data.password == data.confirmPassword, { message: "Passwords do not match", path: ['confirmPassword'] });


const SignUp = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [submitError, setsubmitError] = useState('')
    const [confirmation, setConfirmation] = useState(false)

    const codeExchangeError = useMemo(() => {
        if (!searchParams) return '';
        return searchParams.get('error_description');
    }, [searchParams])

    const confirmationAndErrorStyles = useMemo(() => clsx('bg-primary', {
        'bg-red-500/10': codeExchangeError,
        'border-red-500/50': codeExchangeError,
        'text-red-700': codeExchangeError,
    }), [])

    const form = useForm<z.infer<typeof SignUpFormSchema>>({
        mode: 'onChange',
        resolver: zodResolver(SignUpFormSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        }
    })

    const isLoading = form.formState.isSubmitting;


    const onSubmit = async ({email,password}:z.infer<typeof FormSchema>) => { 
        const {error} = await actionSignUpUser({email,password});
        // console.log(error,confirmation,codeExchangeError);
        if (error){
            setsubmitError(error.message);
            form.reset();
            return;
        }

        setConfirmation(true);
    };

    return (
        <Form {...form}>
            <form onChange={() => {
                if (submitError) setsubmitError('')
            }} onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col w-full sm:justify-center sm:w-[400px] space-y-6 '>

                <Link href='/' className='w-full flex justify-start items-center'>
                    <h3 className='text-4xl p-3 dark:text-white font-semibold'>noshun</h3>

                </Link>

                <FormDescription className='text-foreground/60'>All-in-One Collaboration and Productivity Platform</FormDescription>

                {!confirmation && !codeExchangeError &&
                    <>

                        <FormField disabled={isLoading}
                            control={form.control}
                            name='email'
                            render={({field}) => (

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
                            render={({field}) => (

                                <FormItem>
                                    <FormControl>
                                        <Input type='password' placeholder='Password' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        >

                        </FormField>

                        <FormField disabled={isLoading}
                            control={form.control}
                            name='confirmPassword'
                            render={({field}) => (

                                <FormItem>
                                    <FormControl>
                                        <Input type='password' placeholder='Confirm Password' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        >

                        </FormField>


                        <Button type='submit' className='w-full p-6' disabled={isLoading}>
                            {!isLoading ? 'Create Account' : <Loader />}
                        </Button>
                    </>
                }

                {submitError && <FormMessage>{submitError}</FormMessage>}

                <span className='self-center'>Already have an account?  {" "}
                    <Link href={'/login'} className='text-primary'>Login</Link>
                </span>

                {(confirmation || codeExchangeError) && (
          <>
            <Alert className={confirmationAndErrorStyles}>
              {!codeExchangeError && <MailCheck className="h-4 w-4" />}
              <AlertTitle>
                {codeExchangeError ? 'Invalid Link' : 'Check your email.'}
              </AlertTitle>
              <AlertDescription>
                {codeExchangeError || 'An email confirmation has been sent.'}
              </AlertDescription>
            </Alert>
          </>
        )}


            </form>

        </Form>
    )
}

export default SignUp