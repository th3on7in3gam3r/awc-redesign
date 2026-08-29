import * as React from 'react';

interface EventImageLightboxProps {
  imageUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

const EventImageLightbox: React.FC<EventImageLightboxProps> = ({
  imageUrl,
  title,
  isOpen,
  onClose,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-church-burgundy/90 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close image preview"
      />
      <div className="relative z-10 w-full max-w-4xl animate-slide-up">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/90 hover:text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2"
        >
          Close
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <img src={imageUrl} alt={title} className="w-full max-h-[80vh] object-contain bg-gray-50" />
          <p className="px-6 py-4 text-center text-church-burgundy font-semibold serif">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default EventImageLightbox;
