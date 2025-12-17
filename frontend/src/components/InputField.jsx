function InputField({
  icon: Icon,
  rightIcon,
  onRightIconClick,
  type = "text",
  placeholder,
  value,
  onChange,
  name, // 👈 RECEBE O NAME
}) {
  return (
    <div className="input-field">
      {Icon && <Icon className="icon icon-user" />}

      <input
        name={name}        // 👈 PASSA PARA O INPUT
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />

      {rightIcon && (
        <span
          className="icon toggle-password"
          onClick={onRightIconClick}
        >
          {rightIcon}
        </span>
      )}
    </div>
  );
}

export default InputField;
