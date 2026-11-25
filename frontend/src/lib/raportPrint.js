export async function waitForRaportImages(container) {
  const images = container?.querySelectorAll('img') ?? [];
  await Promise.allSettled(Array.from(images, image => image.decode()));
}
