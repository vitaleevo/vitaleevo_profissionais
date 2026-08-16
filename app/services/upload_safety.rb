require "marcel"

class UploadSafety
  CONTENT_TYPE_SIGNATURES = {
    "application/pdf" => ->(header) { header.start_with?("%PDF-".b) },
    "image/jpeg" => ->(header) { header.start_with?("\xFF\xD8\xFF".b) },
    "image/png" => ->(header) { header.start_with?("\x89PNG\r\n\x1A\n".b) },
    "image/webp" => ->(header) { header.start_with?("RIFF".b) && header.byteslice(8, 4) == "WEBP".b }
  }.freeze

  CONTENT_TYPE_EXTENSIONS = {
    "application/pdf" => %w[.pdf],
    "image/jpeg" => %w[.jpg .jpeg],
    "image/png" => %w[.png],
    "image/webp" => %w[.webp]
  }.freeze

  def self.detected_content_type(uploaded_file)
    io = uploaded_file.tempfile
    io.rewind if io.respond_to?(:rewind)

    Marcel::MimeType.for(
      io,
      name: uploaded_file.original_filename,
      declared_type: uploaded_file.content_type
    )
  ensure
    io&.rewind if io&.respond_to?(:rewind)
  end

  def self.allowed_content_type?(uploaded_file, allowed_content_types)
    return false unless uploaded_file.respond_to?(:tempfile)
    return false unless uploaded_file.respond_to?(:original_filename)
    return false unless uploaded_file.respond_to?(:content_type)

    signature_content_type = signature_content_type(uploaded_file)
    allowed_content_types.include?(uploaded_file.content_type) &&
      allowed_content_types.include?(detected_content_type(uploaded_file)) &&
      allowed_content_types.include?(signature_content_type) &&
      extension_allowed?(uploaded_file.original_filename, signature_content_type)
  end

  def self.signature_content_type(uploaded_file)
    header = read_header(uploaded_file)
    CONTENT_TYPE_SIGNATURES.find { |_content_type, matcher| matcher.call(header) }&.first
  end

  def self.extension_allowed?(filename, content_type)
    extension = File.extname(filename.to_s).downcase
    CONTENT_TYPE_EXTENSIONS.fetch(content_type, []).include?(extension)
  end

  def self.read_header(uploaded_file)
    io = uploaded_file.tempfile
    io.rewind if io.respond_to?(:rewind)
    io.read(16).to_s.b
  ensure
    io&.rewind if io&.respond_to?(:rewind)
  end
end
