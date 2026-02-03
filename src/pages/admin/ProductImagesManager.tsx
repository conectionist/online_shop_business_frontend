import React from 'react';
import { useUploadProductImage, useDeleteProductImage, useReorderProductImages, useSetPrimaryImage } from '@/hooks/useProducts';
import { getProductImageUrlFromImage } from '@/services/api';
import { Trash2, Star, Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useSystemConfig } from '@/hooks/useSystem';
import { IMAGE_UPLOAD } from '@/utils/constants';
import { getImageValidationMessage } from '@/utils/imageUploadErrors';
import { validateImageFile } from '@/utils/validateImageFile';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProductImagesManagerProps {
  productId: number;
  images: any[];
}

const SortableImageItem: React.FC<{
  image: any;
  onDelete: (id: number) => void;
  onPrimary: (id: number) => void;
}> = ({ image, onDelete, onPrimary }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} className="relative w-56 h-56 sm:w-60 sm:h-60 rounded-lg overflow-hidden border border-amber-200 shadow-sm">
      <img src={getProductImageUrlFromImage(image, 'medium')} alt="img" className="w-full h-full object-cover" {...attributes} {...listeners} />
      <div className="absolute top-1 right-1 flex gap-1">
        <button
          type="button"
          className={`p-0.5 sm:p-1 rounded ${image.is_primary ? 'bg-amber-500 text-white' : 'bg-white/90 text-gray-700 border'}`}
          onClick={() => onPrimary(image.id)}
          title="Setează principal"
        >
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
        <button
          type="button"
          className="p-0.5 sm:p-1 rounded bg-white/90 text-red-600 border"
          onClick={() => onDelete(image.id)}
          title="Șterge"
        >
          <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      </div>
    </div>
  );
};

const ProductImagesManager: React.FC<ProductImagesManagerProps> = ({ productId, images }) => {
  const uploadMutation = useUploadProductImage();
  const deleteMutation = useDeleteProductImage();
  const reorderMutation = useReorderProductImages();
  const setPrimaryMutation = useSetPrimaryImage();
  const { data: systemConfig } = useSystemConfig();
  const maxImageSizeMb = systemConfig?.max_image_size_mb ?? IMAGE_UPLOAD.MAX_SIZE_MB;
  const maxImageSizeBytes = maxImageSizeMb * 1024 * 1024;

  const [localImages, setLocalImages] = React.useState(images?.slice().sort((a, b) => a.position - b.position) || []);
  React.useEffect(() => {
    setLocalImages(images?.slice().sort((a, b) => a.position - b.position) || []);
  }, [images]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDrop = async (evt: any) => {
    const { active, over } = evt;
    if (!over || active.id === over.id) return;

    const oldIndex = localImages.findIndex((i: any) => i.id === active.id);
    const newIndex = localImages.findIndex((i: any) => i.id === over.id);
    const newOrder = arrayMove(localImages, oldIndex, newIndex).map((img: any, idx: number) => ({ ...img, position: idx }));
    setLocalImages(newOrder);
    // Persist
    reorderMutation.mutate({ productId, mappings: newOrder.map((img: any, idx: number) => ({ id: img.id, position: idx })) });
  };

  const [uploadErrors, setUploadErrors] = React.useState<string[]>([]);
  const [stagedFiles, setStagedFiles] = React.useState<Array<{ file: File; previewUrl: string }>>([]);

  // Stage files with preview (no immediate upload)
  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const nextErrors: string[] = [];
    const toValidate: File[] = [];
    Array.from(files).forEach((file) => {
      if (!IMAGE_UPLOAD.ACCEPTED_TYPES.includes(file.type as any)) {
        nextErrors.push(IMAGE_UPLOAD.ERROR_MESSAGES.INVALID_FILE_TYPE(IMAGE_UPLOAD.ACCEPTED_EXTENSIONS));
        return;
      }
      if (file.size > maxImageSizeBytes) {
        nextErrors.push(IMAGE_UPLOAD.ERROR_MESSAGES.FILE_TOO_LARGE(maxImageSizeMb));
        return;
      }
      toValidate.push(file);
    });

    const results = await Promise.allSettled(toValidate.map((file) => validateImageFile(file)));
    const nextStaged: Array<{ file: File; previewUrl: string }> = [];
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        const file = toValidate[i];
        nextStaged.push({ file, previewUrl: URL.createObjectURL(file) });
      } else {
        nextErrors.push(IMAGE_UPLOAD.ERROR_MESSAGES.INVALID_IMAGE_CONTENT);
      }
    });

    setStagedFiles((prev) => [...prev, ...nextStaged]);
    setUploadErrors(nextErrors);
  };

  // Remove one staged file
  const removeStagedAt = (index: number) => {
    setStagedFiles((prev) => {
      const copy = [...prev];
      const removed = copy.splice(index, 1)[0];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  };

  // Commit upload of all staged files
  const commitStagedUpload = async () => {
    setUploadErrors([]);
    try {
      for (const item of stagedFiles) {
        await uploadMutation.mutateAsync({ productId, image: item.file });
        URL.revokeObjectURL(item.previewUrl);
      }
      setStagedFiles([]);
    } catch (error: any) {
      setUploadErrors([getImageValidationMessage(error, maxImageSizeMb)]);
    }
  };

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      stagedFiles.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (imageId: number) => {
    deleteMutation.mutate({ productId, imageId });
  };

  const handlePrimary = (imageId: number) => {
    setPrimaryMutation.mutate({ productId, imageId });
  };

  // Mobile reordering (modal + native drag like ListProductsTab2)
  const [showReorderModal, setShowReorderModal] = React.useState(false);
  const [draggedImageId, setDraggedImageId] = React.useState<number | null>(null);
  const [mobileOrder, setMobileOrder] = React.useState<number[]>([]);

  React.useEffect(() => {
    setMobileOrder(localImages.map((i: any) => i.id));
  }, [localImages]);

  const openReorderModal = () => {
    setMobileOrder(localImages.map((i: any) => i.id));
    setShowReorderModal(true);
  };

  const handleDragStartMobile = (e: React.DragEvent, id: number) => {
    setDraggedImageId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverMobile = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropMobile = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedImageId || draggedImageId === targetId) return;

    const current = [...mobileOrder];
    const draggedIndex = current.indexOf(draggedImageId);
    const targetIndex = current.indexOf(targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    current.splice(draggedIndex, 1);
    current.splice(targetIndex, 0, draggedImageId);
    setMobileOrder(current);
    setDraggedImageId(null);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= mobileOrder.length) return;
    const updated = [...mobileOrder];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setMobileOrder(updated);
  };

  const saveMobileOrder = () => {
    const newImages = mobileOrder.map((id: number, idx: number) => {
      const img = localImages.find((i: any) => i.id === id);
      return { ...(img as any), position: idx };
    });
    setLocalImages(newImages);
    reorderMutation.mutate({
      productId,
      mappings: mobileOrder.map((id: number, idx: number) => ({ id, position: idx })),
    });
    setShowReorderModal(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Imagini produs</h3>
        <div className="flex items-center gap-2">
          <Button type="button" className="sm:hidden" variant="outline" size="sm" onClick={openReorderModal}>
            Reordonează
          </Button>
        </div>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDrop}>
        <SortableContext items={localImages.map((i: any) => i.id)} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {localImages.map((img: any) => (
              <SortableImageItem key={img.id} image={img} onDelete={handleDelete} onPrimary={handlePrimary} />)
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Upload below images (styled like single uploader) */}
      <div>
        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          uploadErrors.length > 0 ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <Upload className={`w-8 h-8 mx-auto mb-2 ${uploadErrors.length > 0 ? 'text-red-400' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600 mb-2">Adăugați imagini pentru produs (opțional)</p>
          <p className="text-xs text-gray-500 mb-3">
            {IMAGE_UPLOAD.UI_TEXT.FORMATS_ACCEPTED}: {IMAGE_UPLOAD.ACCEPTED_EXTENSIONS.join(', ')} ({IMAGE_UPLOAD.UI_TEXT.MAX_SIZE} {maxImageSizeMb}MB)
          </p>
          <input
            id="product-images-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <label
            htmlFor="product-images-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Alege Imagini
          </label>
          {uploadErrors.length > 0 && (
            <div className="mt-2 space-y-1">
              {uploadErrors.map((msg, idx) => (
                <p key={idx} className="text-sm text-red-600">{msg}</p>
              ))}
            </div>
          )}
        </div>
        {/* Staged previews */}
        {stagedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              {stagedFiles.map((item, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded overflow-hidden border bg-gray-50">
                  <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
                  {/* primary badge on first staged */}
                  {localImages.length === 0 && idx === 0 && (
                    <span className="absolute top-1 left-1 text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Principală</span>
                  )}
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 leading-none flex items-center justify-center"
                    onClick={() => removeStagedAt(idx)}
                    aria-label="Elimină"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => {
                stagedFiles.forEach((it) => URL.revokeObjectURL(it.previewUrl));
                setStagedFiles([]);
              }}>Renunță</Button>
              <Button type="button" onClick={commitStagedUpload} loading={uploadMutation.isPending}>Încarcă imaginile</Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile reorder modal */}
      <Modal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
        title="Schimbă Ordinea Imaginilor"
      >
        <div className="space-y-2">
          {mobileOrder.map((id: number, index: number) => {
            const image = localImages.find((i: any) => i.id === id);
            if (!image) return null;
            return (
              <div
                key={id}
                draggable
                onDragStart={(e) => handleDragStartMobile(e, id)}
                onDragOver={handleDragOverMobile}
                onDrop={(e) => handleDropMobile(e, id)}
                className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-move transition-colors ${
                  draggedImageId === id ? 'bg-blue-100 border-blue-300' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500 w-6 text-center">{index + 1}</div>
                  <img
                    src={getProductImageUrlFromImage(image, 'medium')}
                    alt="img"
                    className="w-12 h-12 object-cover rounded"
                  />
                  {index === 0 && (
                    <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Principală</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {index > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => moveItem(index, -1)}>↑</Button>
                  )}
                  {index < mobileOrder.length - 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => moveItem(index, 1)}>↓</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={() => setShowReorderModal(false)}>Anulează</Button>
          <Button type="button" onClick={saveMobileOrder}>Salvează Ordinea</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductImagesManager;


