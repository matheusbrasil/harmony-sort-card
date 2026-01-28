module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./hooks/**/*.{js,jsx,ts,tsx}", "./constants/**/*.{js,jsx,ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0f",
        card: "#15141b",
        tonic: "#4f8cff",
        subdominant: "#38b98a",
        dominant: "#f39c3d",
      },
      boxShadow: {
        glow: "0px 12px 40px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
