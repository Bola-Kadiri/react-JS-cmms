import { useState } from 'react';
import { 
  FileUp,
  Download,
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  FileAudio,
  FileVideo,
  ExternalLink,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Resource {
  content_type: number;
  object_id: number;
  file: string;
}

interface FileAttachmentsSectionProps {
  resources: Resource[];
}

const FileAttachmentsSection = ({ resources }: FileAttachmentsSectionProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Extract filename from URL
  const getFilename = (url: string): string => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  // Determine file type based on extension
  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'spreadsheet';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) return 'audio';
    if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) return 'video';
    if (['html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml'].includes(extension)) return 'code';
    
    return 'generic';
  };

  // Get appropriate icon based on file type
  const getFileIcon = (filename: string) => {
    const fileType = getFileType(filename);
    const iconClassName = "h-10 w-10 p-2 rounded-md";
    
    switch (fileType) {
      case 'image':
        return <FileImage className={`${iconClassName} text-purple-500 bg-purple-50`} />;
      case 'pdf':
        return <FileText className={`${iconClassName} text-red-500 bg-red-50`} />;
      case 'document':
        return <FileText className={`${iconClassName} text-blue-500 bg-blue-50`} />;
      case 'spreadsheet':
        return <FileSpreadsheet className={`${iconClassName} text-green-500 bg-green-50`} />;
      case 'archive':
        return <FileArchive className={`${iconClassName} text-amber-500 bg-amber-50`} />;
      case 'audio':
        return <FileAudio className={`${iconClassName} text-pink-500 bg-pink-50`} />;
      case 'video':
        return <FileVideo className={`${iconClassName} text-indigo-500 bg-indigo-50`} />;
      case 'code':
        return <FileCode className={`${iconClassName} text-cyan-500 bg-cyan-50`} />;
      default:
        return <File className={`${iconClassName} text-gray-500 bg-gray-50`} />;
    }
  };

  // Format file size (dummy function since we don't have size in the response)
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Get file size estimation (approximation only)
  const getEstimatedSize = (fileType: string): string => {
    switch (fileType) {
      case 'image': return '0.8 - 2.5 MB';
      case 'pdf': return '1.2 - 3.0 MB';
      case 'document': return '0.5 - 1.5 MB';
      case 'spreadsheet': return '0.7 - 2.0 MB';
      case 'archive': return '2.0 - 10.0 MB';
      case 'audio': return '3.0 - 15.0 MB';
      case 'video': return '10.0 - 50.0 MB';
      case 'code': return '0.1 - 0.5 MB';
      default: return '1.0 - 5.0 MB';
    }
  };

  // Get date from filename if it contains a date pattern (very simple approximation)
  const getDateInfo = (filename: string): string => {
    // Check if filename contains a date pattern like YYYY-MM-DD
    const dateMatch = filename.match(/(\d{4}[-_]\d{2}[-_]\d{2})/);
    if (dateMatch) {
      return `Uploaded on ${dateMatch[0].replace(/_/g, '-')}`;
    }
    
    // Just return a placeholder
    return 'Recently uploaded';
  };

  // Handle file download
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file preview for images
  const handlePreview = (url: string) => {
    setPreviewImage(url);
  };

  // Open file in new tab
  const handleOpenInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileUp className="h-5 w-5 text-primary" />
          Files & Attachments
          <Badge variant="outline" className="ml-2">
            {resources.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resources.length > 0 ? (
          <div className="space-y-3">
            {resources.map((resource, index) => {
              const filename = getFilename(resource.file);
              const fileType = getFileType(filename);
              const isImage = fileType === 'image';
              
              return (
                <div 
                  key={index} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    {getFileIcon(filename)}
                    <div>
                      <p className="font-medium break-all">{filename}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {getEstimatedSize(fileType)}
                        </p>
                        <Separator orientation="vertical" className="h-3 mx-1" />
                        <p className="text-xs text-muted-foreground">
                          {getDateInfo(filename)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    {isImage && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{filename}</DialogTitle>
                            <DialogDescription>
                              Image preview for {filename}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="overflow-auto max-h-[70vh]">
                            <img 
                              src={resource.file} 
                              alt={filename} 
                              className="max-w-full h-auto rounded-md"
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenInNewTab(resource.file)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in New Tab
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleDownload(resource.file, filename)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenInNewTab(resource.file)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline ml-1">Open</span>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDownload(resource.file, filename)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline ml-1">Download</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-12 border border-dashed rounded-md">
            <FileUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">No files attached</p>
            <p className="text-xs text-muted-foreground mt-2">
              Files associated with this item will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileAttachmentsSection;