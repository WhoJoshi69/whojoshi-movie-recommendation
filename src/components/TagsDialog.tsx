import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagItem {
  name: string;
  url: string;
}

interface TagsDialogProps {
  onTagSelect: (tagUrl: string, tagName: string) => void;
  className?: string;
}

const TagsDialog = ({ onTagSelect, className }: TagsDialogProps) => {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [filteredTags, setFilteredTags] = useState<TagItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load tags from JSON file
  useEffect(() => {
    const loadTags = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/tags.json');
        if (response.ok) {
          const tagsData = await response.json();
          setTags(tagsData);
          setFilteredTags(tagsData);
        } else {
          console.error('Failed to load tags');
        }
      } catch (error) {
        console.error('Error loading tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  // Filter tags based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTags(tags);
    } else {
      const filtered = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTags(filtered);
    }
  }, [searchTerm, tags]);

  const handleTagClick = (tag: TagItem) => {
    // Extract the tag path from the full URL
    const tagPath = tag.url.replace('https://bestsimilar.com', '');
    onTagSelect(tagPath, tag.name);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 bg-background/50 backdrop-blur-sm border-border hover:bg-muted/50 transition-all duration-200",
            className
          )}
        >
          <Tag className="w-4 h-4" />
          <span className="hidden sm:inline">Tags</span>
        </Button>
      </DialogTrigger>
<DialogContent className="max-w-2xl w-full flex flex-col max-h-[80vh]">
  <DialogHeader>
    <DialogTitle className="flex items-center gap-2">
      <Tag className="w-5 h-5" />
      Browse Tags
    </DialogTitle>
  </DialogHeader>

  <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
    {/* Search Input */}
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search tags..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>

    {/* Scrollable Tags */}
    <div className="flex-1 overflow-y-auto">
      <ScrollArea className="h-full">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-1">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="h-8 bg-muted rounded-full animate-pulse" />
            ))}
          </div>
        ) : filteredTags.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-1">
            {filteredTags.map((tag, index) => (
              <Badge
                key={`${tag.name}-${index}`}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 justify-center py-2 px-3 text-center break-words"
                onClick={() => handleTagClick(tag)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tags found matching "{searchTerm}"</p>
          </div>
        )}
      </ScrollArea>
    </div>

    {/* Footer */}
    <div className="text-xs text-muted-foreground text-center border-t pt-3">
      {filteredTags.length > 0 && (
        <p>Showing {filteredTags.length} of {tags.length} tags</p>
      )}
    </div>
  </div>
</DialogContent>

    </Dialog>
  );
};

export default TagsDialog;