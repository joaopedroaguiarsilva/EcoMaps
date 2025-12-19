function InputField({
  icon: Icon,
  rightIcon,
  onRightIconClick,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
}) {
  return (
    <div className="input-field">
      {Icon && <Icon className="icon icon-user" />}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        name={name}
        onChange={onChange}
        required
      />

      {rightIcon && (
        <span className="icon toggle-password" onClick={onRightIconClick}>
          {rightIcon}
        </span>
      )}
    </div>
  );
}

export default InputField;
