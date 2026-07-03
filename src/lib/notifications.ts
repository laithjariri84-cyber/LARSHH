import { toast } from "sonner";

export const notify = {
  success(title: string, description?: string) {
    toast.success(title, { description });
  },
  error(title: string, description?: string) {
    toast.error(title, { description });
  },
  info(title: string, description?: string) {
    toast.info(title, { description });
  },
  listingImported(count: number) {
    toast.success("Listing Imported", {
      description: `${count} ${count === 1 ? "property" : "properties"} added to your portfolio.`,
    });
  },
  photoUploaded(count = 1) {
    toast.success("Photo Uploaded", {
      description:
        count === 1
          ? "Your photo has been added to the gallery."
          : `${count} photos have been added to the gallery.`,
    });
  },
  changesSaved() {
    toast.success("Changes Saved", {
      description: "Your updates have been saved successfully.",
    });
  },
  errorOccurred(message?: string) {
    toast.error("Error Occurred", {
      description: message ?? "Something went wrong. Please try again.",
    });
  },
  addedToFavorites(title: string) {
    toast.success("Added to Favorites", { description: title });
  },
  removedFromFavorites(title: string) {
    toast.info("Removed from Favorites", { description: title });
  },
  linkCopied() {
    toast.success("Link Copied", {
      description: "Property link copied to clipboard.",
    });
  },
  imageUrlCopied() {
    toast.success("Image URL Copied", {
      description: "Photo link copied to clipboard.",
    });
  },
  imageShared() {
    toast.success("Image Shared", {
      description: "Photo link ready to share.",
    });
  },
  photoDeleted() {
    toast.success("Photo Deleted", {
      description: "The image has been removed from this listing.",
    });
  },
};
