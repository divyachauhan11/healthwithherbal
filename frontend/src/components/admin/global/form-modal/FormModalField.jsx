import {
  CheckboxField,
  CustomField,
  ImagesField,
  MarkdownField,
  RadioCardsField,
  SelectField,
  SlugField,
  TextareaField,
  TextInputField,
} from "../form-fields";
import { isFieldHidden, isImageField, isWideField } from "./form-modal-utils";

/**
 * Render one FormModal schema field with the component for its `type`
 * (custom, images, checkbox, radio-cards, select, markdown, textarea, slug,
 * otherwise a plain input). Hidden fields render nothing.
 * @param {object} props
 * @param {object} props.field Schema field config.
 * @param {object} props.form Current form values.
 * @param {string[]} props.images Current image list (image fields).
 * @param {(images: string[]) => void} props.onImagesChange Stable image list setter.
 * @param {(name: string, value: *) => void} props.onFieldChange Updates a field value.
 * @param {(fieldName: string, rawValue: string) => void} props.onSlugInput Handles typing in a slug field.
 */
export function FormModalField({
  field,
  form,
  images,
  onImagesChange,
  onFieldChange,
  onSlugInput,
}) {
  if (isFieldHidden(field, form)) return null;

  const isWide = isWideField(field);
  const value = form[field.name];
  const onChange = (nextValue) => onFieldChange(field.name, nextValue);

  if (field.type === "custom" && typeof field.render === "function") {
    return (
      <CustomField
        field={field}
        isWide={isWide}
        value={value}
        onChange={onChange}
        form={form}
        update={onFieldChange}
      />
    );
  }
  if (isImageField(field)) {
    return <ImagesField field={field} images={images} onChange={onImagesChange} />;
  }
  if (field.type === "checkbox") {
    return <CheckboxField field={field} value={value} onChange={onChange} />;
  }
  if (field.type === "radio-cards") {
    return <RadioCardsField field={field} value={value} onChange={onChange} />;
  }
  if (field.type === "select") {
    return <SelectField field={field} isWide={isWide} value={value} onChange={onChange} />;
  }
  if (field.type === "markdown") {
    return <MarkdownField field={field} isWide={isWide} value={value} onChange={onChange} />;
  }
  if (field.type === "textarea") {
    return <TextareaField field={field} isWide={isWide} value={value} onChange={onChange} />;
  }
  if (field.type === "slug") {
    return (
      <SlugField
        field={field}
        isWide={isWide}
        value={value}
        onChange={(rawValue) => onSlugInput(field.name, rawValue)}
      />
    );
  }
  return <TextInputField field={field} isWide={isWide} value={value} onChange={onChange} />;
}
