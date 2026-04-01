import { FileUploadTool } from "@/components/file-upload-tool";

export default function DuplicateFinder() {
  return (
    <FileUploadTool
      title="Duplicate Image Finder"
      description="Upload multiple images to find visually similar duplicates."
      endpoint="/api/tools/duplicate-finder"
      accept="image/*"
      multiple={true}
      resultType="json"
    />
  );
}
