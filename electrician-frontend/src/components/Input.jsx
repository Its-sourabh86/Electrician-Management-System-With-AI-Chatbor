
export default function Input({ label, type = "text", name, value, onChange, error, placeholder, ...props }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">{label}</label>
            <input
                type={type}
                name={name}
                {...(type !== "file" ? { value } : {})}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${error ? "border-red-500 focus:border-red-500" : "border-slate-700 focus:border-cyan-500"
                    } text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 ${type === "file" ? "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 cursor-pointer" : ""}`}
                {...props}
            />
            {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        </div>
    );
}
