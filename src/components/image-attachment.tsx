import { useEffect, useState } from 'react';
import { Carousel } from '@mantine/carousel';
import { Badge, Box, Group, Image } from '@mantine/core';
import { modals } from '@mantine/modals';
import { getImageUrl } from '@/api/resources';

interface MultipleImageAttachmentProps {
  file_ids: (string | undefined | null)[];
  alt?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  resize_type?: 'fit' | 'fill' | 'fill-down' | 'force' | 'auto';
  enlarge?: boolean;
  extension?: string;
}

export function MultipleImageAttachment({
  file_ids,
  alt = 'Attachment Image',
  thumbnailWidth = 120,
  thumbnailHeight = 120,
  resize_type = 'fit',
  enlarge = true,
  extension = 'jpg',
}: MultipleImageAttachmentProps) {
  const [thumbnails, setThumbnails] = useState<(string | null)[]>([]);

  const validFileIds = file_ids.filter((id): id is string => !!id);

  useEffect(() => {
    if (validFileIds.length === 0) return;

    Promise.all(
      validFileIds.map((file_id) =>
        getImageUrl(file_id, {
          width: thumbnailWidth,
          height: thumbnailHeight,
          resize_type,
          enlarge,
          extension,
        })
      )
    ).then(setThumbnails);
  }, []);

  if (thumbnails.length === 0) {
    return null;
  }

  const handleClick = () => {
    Promise.all(
      validFileIds.map((file_id) =>
        getImageUrl(file_id, {
          width: 1000,
          height: 1000,
          resize_type,
          enlarge,
          extension,
        })
      )
    ).then((fullSizes) => {
      modals.open({
        size: 'xl',
        children: (
          <Box>
            {fullSizes.map((src, index) => (
              <Image key={index} src={src} alt={`${alt} ${index + 1}`} fit="contain" mb="md" />
            ))}
          </Box>
        ),
      });
    });
  };

  return (
    <Box
      pos="relative"
      style={{ display: 'inline-block', cursor: 'pointer' }}
      onClick={handleClick}
    >
      <Group gap="xs" wrap="nowrap">
        {thumbnails.slice(0, 3).map((src, index) => (
          <Image
            key={index}
            src={src}
            alt={`${alt} ${index + 1}`}
            w={thumbnailWidth}
            h={thumbnailHeight}
            fit="cover"
            style={{ borderRadius: 4 }}
          />
        ))}
      </Group>
      {validFileIds.length > 1 && (
        <Badge
          pos="absolute"
          top={8}
          right={8}
          size="lg"
          variant="filled"
          style={{ pointerEvents: 'none' }}
        >
          {validFileIds.length}
        </Badge>
      )}
    </Box>
  );
}

interface CarouselImageAttachmentProps {
  file_ids: (string | undefined | null)[];
  alt?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  resize_type?: 'fit' | 'fill' | 'fill-down' | 'force' | 'auto';
  enlarge?: boolean;
  extension?: string;
}

export function CarouselImageAttachment({
  file_ids,
  alt = 'Attachment Image',
  thumbnailWidth = 1000,
  thumbnailHeight = 500,
  resize_type = 'fit',
  enlarge = true,
  extension = 'jpg',
}: CarouselImageAttachmentProps) {
  const [thumbnails, setThumbnails] = useState<(string | null)[]>([]);

  const validFileIds = file_ids.filter((id): id is string => !!id);

  useEffect(() => {
    if (validFileIds.length === 0) return;

    Promise.all(
      validFileIds.map((file_id) =>
        getImageUrl(file_id, {
          width: thumbnailWidth,
          height: thumbnailHeight,
          resize_type,
          enlarge,
          extension,
        })
      )
    ).then(setThumbnails);
  }, []);

  if (thumbnails.length === 0) {
    return null;
  }

  return (
    <Carousel
      slideSize="70%"
      slideGap="md"
      controlsOffset="sm"
      controlSize={26}
      withControls
      withIndicators={false}
    >
      {thumbnails.slice(0, 3).map((src, index) => (
        <Carousel.Slide key={index}>
          <Image
            src={src}
            alt={`${alt} ${index + 1}`}
            w={thumbnailWidth}
            h={thumbnailHeight}
            fit="cover"
            style={{ borderRadius: 4 }}
          />
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
