type HoneypotInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function HoneypotInput({ value, onChange }: HoneypotInputProps) {
  return (
    <input
      type='text'
      name='website'
      value={value}
      onChange={event => onChange(event.target.value)}
      autoComplete='off'
      tabIndex={-1}
      aria-hidden='true'
      className='pointer-events-none absolute left-[-10000px] top-auto h-px w-px opacity-0'
    />
  );
}
