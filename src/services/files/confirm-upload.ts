import { prisma } from '../../lib/prisma'

interface ConfirmUploadRequest {
  fileId: string
}

interface ConfirmUploadResponse {
  success: boolean
}

export async function confirmUpload({
  fileId,
}: ConfirmUploadRequest): Promise<ConfirmUploadResponse> {
  await prisma.file.update({
    where: { id: fileId },
    data: { status: 'UPLOADED' },
  })

  return { success: true }
}
