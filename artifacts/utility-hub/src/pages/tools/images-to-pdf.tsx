import { FileUploadTool } from "@/components/file-upload-tool";

export default function ImagesToPdf() {
  return (
    <FileUploadTool
      title="Images to PDF"
      description="Combine multiple images into a single PDF document."
      endpoint="/api/tools/images-to-pdf"
      accept="image/*"
      multiple={true}
      resultType="blob"
      downloadExt="pdf"
    />
  );
}
