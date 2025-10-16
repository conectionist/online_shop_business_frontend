import React from 'react';
import { useUploadProductImage, useDeleteProductImage, useReorderProductImages, useSetPrimaryImage } from '@/hooks/useProducts';
import { getProductImageUrlFromImage } from '@/services/api';
import { Trash2, Star, Upload } from 'lucide-react';
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
    <div ref={setNodeRef} style={style} className="relative w-24 h-24 rounded-lg overflow-hidden border border-amber-200 shadow-sm">
      <img src={getProductImageUrlFromImage(image, 'thumbnail')} alt="img" className="w-full h-full object-cover" {...attributes} {...listeners} />
      <div className="absolute top-1 right-1 flex gap-1">
        <button
          type="button"
          className={`p-1 rounded ${image.is_primary ? 'bg-amber-500 text-white' : 'bg-white/90 text-gray-700 border'}`}
          onClick={() => onPrimary(image.id)}
          title="Setează principal"
        >
          <Star className="w-3 h-3" />
        </button>
        <button
          type="button"
          className="p-1 rounded bg-white/90 text-red-600 border"
          onClick={() => onDelete(image.id)}
          title="Șterge"
        >
          <Trash2 className="w-3 h-3" />
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

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    for (const file of arr) {
      await uploadMutation.mutateAsync({ productId, image: file });
    }
  };

  const handleDelete = (imageId: number) => {
    deleteMutation.mutate({ productId, imageId });
  };

  const handlePrimary = (imageId: number) => {
    setPrimaryMutation.mutate({ productId, imageId });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Imagini produs</h3>
        <label className="inline-flex items-center px-3 py-1.5 border rounded-md shadow-sm text-sm bg-white cursor-pointer">
          <Upload className="w-4 h-4 mr-2" /> Încarcă imagini
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </label>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDrop}>
        <SortableContext items={localImages.map((i: any) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-4 gap-3">
            {localImages.map((img: any) => (
              <SortableImageItem key={img.id} image={img} onDelete={handleDelete} onPrimary={handlePrimary} />)
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ProductImagesManager;


