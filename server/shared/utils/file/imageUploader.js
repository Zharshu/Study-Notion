const cloudinary = require("cloudinary").v2;

exports.uploadImageToCloudinary = async (
  file,
  folder,
  height,
  quality,
  additionalOptions = {}
) => {
  const options = { folder };
  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }
  options.resource_type = "auto";

  // Add timeout for large video uploads (10 minutes)
  options.timeout = 600000; // 600 seconds = 10 minutes

  // Merge any additional options (like raw_convert for transcription)
  Object.assign(options, additionalOptions);

  return await cloudinary.uploader.upload(file.tempFilePath, options);
};
