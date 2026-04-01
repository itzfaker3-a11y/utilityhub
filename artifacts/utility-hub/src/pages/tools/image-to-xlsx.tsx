import { FileUploadTool } from "@/components/file-upload-tool";

export default function ImageToXlsx() {
  return (
    <FileUploadTool
      title="Image to Excel (OCR)"
      description="Extract tabular data from an image into an Excel spreadsheet."
      endpoint="/api/tools/image-to-xlsx"
      accept="image/*"
      resultType="blob"
      downloadExt="xlsx"
    />
  );
}
