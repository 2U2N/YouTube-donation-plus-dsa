local omitted = {
  ["Repository"] = true,
  ["Authorship and Responsibility"] = true,
}

function Pandoc(doc)
  local blocks = pandoc.List()
  local skipping = false
  local skip_level = nil

  for _, block in ipairs(doc.blocks) do
    if block.t == "Header" then
      local title = pandoc.utils.stringify(block.content)
      if omitted[title] then
        skipping = true
        skip_level = block.level
      elseif skipping and block.level <= skip_level then
        skipping = false
        skip_level = nil
      end
    end

    if not skipping then
      blocks:insert(block)
    end
  end

  doc.blocks = blocks
  return doc
end
