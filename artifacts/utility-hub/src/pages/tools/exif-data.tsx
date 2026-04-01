import { FileUploadTool } from "@/components/file-upload-tool";

export default function ExifData() {
  return (
    <FileUploadTool
      title="EXIF Data Extractor"
      description="Extract hidden EXIF metadata embedded in photographs."
      endpoint="/api/tools/exif-data"
      accept="image/*"
      resultType="json"
    />
  );
}
