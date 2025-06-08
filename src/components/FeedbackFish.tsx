import { FeedbackFish } from '@feedback-fish/react';
import { Fish } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeedbackFishComponent = () => {
  return (
    <div className="fixed top-4 right-4 z-[60]">
      <FeedbackFish projectId="f8a40614c9bf8f">
        <Button
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full p-3"
          title="Send Feedback"
        >
          <Fish className="w-5 h-5" />
        </Button>
      </FeedbackFish>
    </div>
  );
};

export default FeedbackFishComponent;