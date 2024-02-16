'use server'
 
import { redirect } from 'next/navigation'
 
export async function navigate(url: string) {
  console.log("server action navigate to", url);
  redirect(url);
}