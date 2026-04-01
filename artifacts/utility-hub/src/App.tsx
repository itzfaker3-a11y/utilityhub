import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/index";
import CategoryPage from "@/pages/category";

// Document & Image
import ConvertImage from "@/pages/tools/convert-image";
import ImagesToPdf from "@/pages/tools/images-to-pdf";
import PdfToImages from "@/pages/tools/pdf-to-images";
import PdfToText from "@/pages/tools/pdf-to-text";
import ImageToText from "@/pages/tools/image-to-text";
import ImageToDocx from "@/pages/tools/image-to-docx";
import ImageToXlsx from "@/pages/tools/image-to-xlsx";
import SvgToPng from "@/pages/tools/svg-to-png";
import HeicConvert from "@/pages/tools/heic-convert";
import ImageToCsv from "@/pages/tools/image-to-csv";
import WordToPdf from "@/pages/tools/word-to-pdf";

// Media & Audio
import AudioToText from "@/pages/tools/audio-to-text";
import ConvertAudio from "@/pages/tools/convert-audio";
import ConvertVideo from "@/pages/tools/convert-video";
import VideoToGif from "@/pages/tools/video-to-gif";

// Web & Data
import UrlToPdf from "@/pages/tools/url-to-pdf";
import UrlToScreenshot from "@/pages/tools/url-to-screenshot";
import FaviconGrabber from "@/pages/tools/favicon-grabber";
import ExifData from "@/pages/tools/exif-data";
import YoutubeThumbnail from "@/pages/tools/youtube-thumbnail";
import OgPreview from "@/pages/tools/og-preview";

// Security & Hashing
import HashText from "@/pages/tools/hash-text";
import FileChecksum from "@/pages/tools/file-checksum";
import Bcrypt from "@/pages/tools/bcrypt";
import Argon2Page from "@/pages/tools/argon2";
import Hmac from "@/pages/tools/hmac";
import PasswordGenerator from "@/pages/tools/password-generator";
import PasswordStrength from "@/pages/tools/password-strength";

// Image Hashing
import ImageHash from "@/pages/tools/image-hash";
import ImageEla from "@/pages/tools/image-ela";
import DuplicateFinder from "@/pages/tools/duplicate-finder";

// Digital Asset
import CssGradient from "@/pages/tools/css-gradient";
import AspectRatio from "@/pages/tools/aspect-ratio";
import SvgOptimizer from "@/pages/tools/svg-optimizer";
import LottiePreviewer from "@/pages/tools/lottie-previewer";

// Developer & Text
import TextCase from "@/pages/tools/text-case";
import Base64 from "@/pages/tools/base64";
import SqlFormatter from "@/pages/tools/sql-formatter";
import JsonCsv from "@/pages/tools/json-csv";
import JsonToExcel from "@/pages/tools/json-to-excel";
import XmlJson from "@/pages/tools/xml-json";
import HtmlMarkdown from "@/pages/tools/html-markdown";
import CsvToHtml from "@/pages/tools/csv-to-html";

// Smart Generators
import LoremIpsum from "@/pages/tools/lorem-ipsum";
import QrCodeGenerator from "@/pages/tools/qr-code";
import UuidGenerator from "@/pages/tools/uuid-generator";
import DummyData from "@/pages/tools/dummy-data";
import Barcode from "@/pages/tools/barcode";

// Productivity
import MarkdownEditor from "@/pages/tools/markdown-editor";
import WordCounter from "@/pages/tools/word-counter";
import RemoveDuplicates from "@/pages/tools/remove-duplicates";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      {/* Document & Image Processing */}
      <Route path="/tools/convert-image" component={ConvertImage} />
      <Route path="/tools/images-to-pdf" component={ImagesToPdf} />
      <Route path="/tools/pdf-to-images" component={PdfToImages} />
      <Route path="/tools/pdf-to-text" component={PdfToText} />
      <Route path="/tools/image-to-text" component={ImageToText} />
      <Route path="/tools/image-to-docx" component={ImageToDocx} />
      <Route path="/tools/image-to-xlsx" component={ImageToXlsx} />
      <Route path="/tools/svg-to-png" component={SvgToPng} />
      <Route path="/tools/heic-convert" component={HeicConvert} />
      <Route path="/tools/image-to-csv" component={ImageToCsv} />
      <Route path="/tools/word-to-pdf" component={WordToPdf} />

      {/* Media & Audio */}
      <Route path="/tools/audio-to-text" component={AudioToText} />
      <Route path="/tools/convert-audio" component={ConvertAudio} />
      <Route path="/tools/convert-video" component={ConvertVideo} />
      <Route path="/tools/video-to-gif" component={VideoToGif} />

      {/* Web & Data */}
      <Route path="/tools/url-to-pdf" component={UrlToPdf} />
      <Route path="/tools/url-to-screenshot" component={UrlToScreenshot} />
      <Route path="/tools/favicon-grabber" component={FaviconGrabber} />
      <Route path="/tools/exif-data" component={ExifData} />
      <Route path="/tools/youtube-thumbnail" component={YoutubeThumbnail} />
      <Route path="/tools/og-preview" component={OgPreview} />

      {/* Security & Hashing */}
      <Route path="/tools/hash-text" component={HashText} />
      <Route path="/tools/file-checksum" component={FileChecksum} />
      <Route path="/tools/bcrypt" component={Bcrypt} />
      <Route path="/tools/argon2" component={Argon2Page} />
      <Route path="/tools/hmac" component={Hmac} />
      <Route path="/tools/password-generator" component={PasswordGenerator} />
      <Route path="/tools/password-strength" component={PasswordStrength} />

      {/* Image Hashing */}
      <Route path="/tools/image-hash" component={ImageHash} />
      <Route path="/tools/image-ela" component={ImageEla} />
      <Route path="/tools/duplicate-finder" component={DuplicateFinder} />

      {/* Digital Asset */}
      <Route path="/tools/css-gradient" component={CssGradient} />
      <Route path="/tools/aspect-ratio" component={AspectRatio} />
      <Route path="/tools/svg-optimizer" component={SvgOptimizer} />
      <Route path="/tools/lottie-previewer" component={LottiePreviewer} />

      {/* Developer & Text */}
      <Route path="/tools/text-case" component={TextCase} />
      <Route path="/tools/base64" component={Base64} />
      <Route path="/tools/sql-formatter" component={SqlFormatter} />
      <Route path="/tools/json-csv" component={JsonCsv} />
      <Route path="/tools/json-to-excel" component={JsonToExcel} />
      <Route path="/tools/xml-json" component={XmlJson} />
      <Route path="/tools/html-markdown" component={HtmlMarkdown} />
      <Route path="/tools/csv-to-html" component={CsvToHtml} />

      {/* Smart Generators */}
      <Route path="/tools/lorem-ipsum" component={LoremIpsum} />
      <Route path="/tools/qr-code" component={QrCodeGenerator} />
      <Route path="/tools/uuid-generator" component={UuidGenerator} />
      <Route path="/tools/dummy-data" component={DummyData} />
      <Route path="/tools/barcode" component={Barcode} />

      {/* Productivity */}
      <Route path="/tools/markdown-editor" component={MarkdownEditor} />
      <Route path="/tools/word-counter" component={WordCounter} />
      <Route path="/tools/remove-duplicates" component={RemoveDuplicates} />

      {/* Category pages — must come AFTER all specific tool routes */}
      <Route path="/tools/:category" component={CategoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="utility-hub-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
