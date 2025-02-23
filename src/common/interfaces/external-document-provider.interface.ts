export interface ExternalDocumentProvider {
  /**
   * Uploads a file to the external storage service
   * @param file The file buffer to upload
   * @param fileName The name to give the file
   * @returns Promise containing the URL of the uploaded file
   */
  uploadFile(file: Buffer, fileName: string): Promise<string>;
} 