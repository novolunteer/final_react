import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const CommonModal = ({ open, onClose, children }) => {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default CommonModal;
