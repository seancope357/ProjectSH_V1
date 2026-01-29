import { supabase } from './client'
import { v4 as uuidv4 } from 'uuid'

export async function uploadImage(file: File, bucketName: string, folderName: string) {
  if (!file) {
    console.error('No file provided for upload.')
    return null
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folderName}/${uuidv4()}.${fileExt}`

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw error
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    return publicUrlData.publicUrl

  } catch (error) {
    console.error('Error uploading image to Supabase:', error)
    return null
  }
}