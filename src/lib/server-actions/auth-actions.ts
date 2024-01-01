"use server"

import { z } from "zod";
import { cookies } from "next/headers";
import { FormSchema } from "../types";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";

export async function actionLoginUser({
    email,password
} : z.infer<typeof FormSchema>) {
    const supabase = createRouteHandlerClient({cookies});
    const response = await supabase.auth.signInWithPassword({
        email, password
    })

    console.log(response);

    return response;
}


export async function actionSignUpUser({email,password} : z.infer<typeof FormSchema>) {
    const supabase = createRouteHandlerClient({cookies});
    const {data} = await supabase.from('profiles').select("*").eq('email',email);
    console.log(data);

    if(data?.length) return {error : {message: "User already exists", data}};

    const response = await supabase.auth.signUp({
        email, password, options :{
            emailRedirectTo : `${process.env.NEXT_PUBLIC_SITE_URL}api/auth/callback`
        }
    })

    return response;
}