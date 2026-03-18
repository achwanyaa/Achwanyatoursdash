'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Initialize the Supabase Service Role client for elevated permissions
// This client bypasses RLS, so it MUST NOT be used for open client-side queries
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key'
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  })
}

export async function lookupClientByEmail(email: string) {
  try {
    const adminSupabase = getAdminClient()
    
    // 1. Find user in auth.users
    const { data: usersData, error: usersError } = await adminSupabase.auth.admin.listUsers()
    
    if (usersError) throw usersError
    
    // Find the specific user (listUsers is paginated, but for an MVP with few users this is fine. 
    // Ideally we'd use getUserById but we don't have the ID yet).
    const user = usersData?.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return { error: 'No client found with this email' }
    }
    
    // 2. Find profile data
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
      
    if (profileError) throw profileError
    
    return { 
      success: true, 
      id: user.id, 
      name: profile.full_name 
    }
    
  } catch (error: any) {
    console.error('Lookup error:', error)
    return { error: error.message || 'Failed to lookup client' }
  }
}

export async function addTourToClient(formData: FormData) {
  const ownerId = formData.get('ownerId') as string
  const title = formData.get('title') as string
  const address = formData.get('address') as string
  const industry = formData.get('industry') as string
  const realseeUrl = formData.get('realseeUrl') as string
  const isActive = formData.get('isActive') === 'true'

  if (!ownerId || !title || !address || !industry || !realseeUrl) {
    return { error: 'All fields are required' }
  }

  try {
    const adminSupabase = getAdminClient()
    
    const { error } = await adminSupabase.from('tours').insert({
      owner_id: ownerId,
      title,
      address,
      industry,
      realsee_url: realseeUrl,
      is_active: isActive
    })

    if (error) throw error

    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Error adding tour:', error)
    return { error: error.message || 'Failed to add tour' }
  }
}

export async function toggleTourStatus(tourId: string, currentStatus: boolean) {
  try {
    const adminSupabase = getAdminClient()
    
    const { error } = await adminSupabase
      .from('tours')
      .update({ is_active: !currentStatus })
      .eq('id', tourId)

    if (error) throw error
    
    revalidatePath('/admin/clients/[clientId]')
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Error toggling tour:', error)
    return { error: error.message || 'Failed to toggle status' }
  }
}

export async function deleteTour(tourId: string) {
  try {
    const adminSupabase = getAdminClient()
    
    const { error } = await adminSupabase
      .from('tours')
      .delete()
      .eq('id', tourId)

    if (error) throw error
    
    revalidatePath('/admin/clients/[clientId]')
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting tour:', error)
    return { error: error.message || 'Failed to delete tour' }
  }
}

export async function updateClientProfile(clientId: string, data: any) {
  try {
    const adminSupabase = getAdminClient()
    
    const { error } = await adminSupabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        whatsapp_number: data.whatsapp_number,
        plan_type: data.plan_type,
        plan_expires_at: data.plan_expires_at
      })
      .eq('id', clientId)

    if (error) throw error
    
    revalidatePath('/admin/clients/[clientId]')
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return { error: error.message || 'Failed to update profile' }
  }
}
