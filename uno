import React, { useMemo, useState } from "react";
import { Search, MapPin, Star, Wifi, Plug, Users, Moon, Coffee, BookOpen, Filter, Plus, X } from "lucide-react";
import { motion } from "framer-motion";

const initialSpots = [
  {
    id: 1,
    name: "Carrier Library",
    area: "Main Campus",
    type: "Library",
    description: "Classic JMU study spot with a mix of quiet floors, group tables, and late-night energy.",
    noise: "Mixed",
    crowd: "High",
    outlets: 4,
    wifi: 5,
    comfort: 4,
    productivity: 5,
    lateNight: true,
    foodNearby: true,
    bestFor: ["Finals grind", "Solo studying", "Late night"],
    tips: "Go upstairs if you actually need quiet. The first floor gets loud fast."
  },
  {
    id: 2,
    name: "Rose Library",
    area: "East Campus",
    type: "Library",
    description: "A calmer library option for East Campus students with good natural light and fewer crowds.",
    noise: "Quiet",
    crowd: "Medium",
    outlets: 4,
    wifi: 5,
    comfort: 4,
    productivity: 5,
    lateNight: true,
    foodNearby: true,
    bestFor: ["Quiet studying", "STEM homework", "Long sessions"],
    tips: "Really good if you want to avoid the Carrier chaos during exams."
  },
  {
    id: 3,
    name: "Student Success Center",
    area: "Near Quad",
    type: "Academic Building",
    description: "Reliable daytime study spot with tutoring, advising, and lots of students passing through.",
    noise: "Mixed",
    crowd: "Medium",
    outlets: 3,
    wifi: 5,
    comfort: 3,
    productivity: 4,
    lateNight: false,
    foodNearby: true,
    bestFor: ["Between classes", "Group work", "Daytime studying"],
    tips: "Good for shorter study blocks, not always the best for deep focus."
  },
  {
    id: 4,
    name: "Festival Conference & Student Center",
    area: "East Campus",
    type: "Student Center",
    description: "Good for casual studying, eating, and group work, but not the quietest option.",
    noise: "Loud",
    crowd: "Medium",
    outlets: 3,
    wifi: 4,
    comfort: 3,
    productivity: 3,
    lateNight: false,
    foodNearby: true,
    bestFor: ["Group projects", "Food nearby", "Casual work"],
    tips: "Better for group work than serious locked-in studying."
  },
  {
    id: 5,
    name: "EnGeo Building",
    area: "East Campus",
    type: "Academic Building",
    description: "Underrated academic building for students who want a more low-key spot.",
    noise: "Quiet",
    crowd: "Low",
    outlets: 3,
    wifi: 4,
    comfort: 3,
    productivity: 4,
    lateNight: false,
    foodNearby: false,
    bestFor: ["Hidden gem", "Quiet studying", "Low crowd"],
    tips: "Not flashy, but it works if you just need somewhere calm."
  },
  {
    id: 6,
    name: "Dorm Lounge",
    area: "Residential Area",
    type: "Residence Hall",
    description: "Convenient if you live nearby, but quality depends heavily on the dorm and time of day.",
    noise: "Mixed",
    crowd: "Low",
    outlets: 2,
    wifi: 4,
    comfort: 3,
    productivity: 3,
    lateNight: true,
    foodNearby: false,
    bestFor: ["Late night", "Convenience", "Quick review"],
    tips: "Great when you do not feel like walking across campus, but distractions are real."
  }
];

const categories = ["All", "Quiet studying", "Group work", "Late night", "Food nearby", "Low crowd", "Finals grind"];
const noiseOptions = ["All", "Quiet", "Mixed", "Loud"];

function scoreAverage(spot) {
  return ((spot.outlets + spot.wifi + spot.comfort + spot.productivity) / 4).toFixed(1);
}

function RatingDots({ value }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((num) => (
        <span
          key={num}
          className={`h-2.5 w-2.5 rounded-full ${num <= value ? "bg-purple-600" : "bg-slate-200"}`}
        />
      ))}
    </div>
  );
}

function SpotCard({ spot, onOpen }) {
  return (
    <motion.button
      layout
      onClick={() => onOpen(spot)}
      className="text-left rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{spot.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin size={14} /> {spot.area} • {spot.type}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700">
          <Star size={15} fill="currentColor" /> {scoreAverage(spot)}
        </div>
      </div>

      <p className="mb-4 text-sm leading-6 text-slate-600">{spot.description}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {spot.bestFor.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-slate-500"><Plug size={15} /> Outlets</div>
          <RatingDots value={spot.outlets} />
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-slate-500"><Wifi size={15} /> WiFi</div>
          <RatingDots value={spot.wifi} />
        </div>
      </div>
    </motion.button>
  );
}

function AddSpotForm({ onAdd, onClose }) {
  const [form, setForm] = useState({
    name: "",
    area: "Main Campus",
    type: "Library",
    description: "",
    noise: "Mixed",
    crowd: "Medium",
    outlets: 3,
    wifi: 4,
    comfort: 3,
    productivity: 4,
    lateNight: false,
    foodNearby: false,
    tips: ""
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd({
      ...form,
      id: Date.now(),
      bestFor: [form.noise === "Quiet" ? "Quiet studying" : "Group work", form.lateNight ? "Late night" : "Daytime studying", form.foodNearby ? "Food nearby" : "Campus spot"]
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <motion.form
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={submit}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add a study spot</h2>
            <p className="text-sm text-slate-500">Mock form for the prototype. Later this can save to a database.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100"><X /></button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Spot name
            <input className="mt-1 w-full rounded-xl border border-slate-200 p-3" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Example: Madison Union" />
          </label>
          <label className="text-sm font-medium text-slate-700">Area
            <input className="mt-1 w-full rounded-xl border border-slate-200 p-3" value={form.area} onChange={(e) => update("area", e.target.value)} />
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">Description
            <textarea className="mt-1 w-full rounded-xl border border-slate-200 p-3" rows="3" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What is the vibe like?" />
          </label>
          <label className="text-sm font-medium text-slate-700">Noise level
            <select className="mt-1 w-full rounded-xl border border-slate-200 p-3" value={form.noise} onChange={(e) => update("noise", e.target.value)}>
              <option>Quiet</option><option>Mixed</option><option>Loud</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Crowd level
            <select className="mt-1 w-full rounded-xl border border-slate-200 p-3" value={form.crowd} onChange={(e) => update("crowd", e.target.value)}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </label>
          {["outlets", "wifi", "comfort", "productivity"].map((field) => (
            <label key={field} className="text-sm font-medium capitalize text-slate-700">{field}
              <input type="range" min="1" max="5" value={form[field]} onChange={(e) => update(field, Number(e.target.value))} className="mt-3 w-full" />
              <span className="text-xs text-slate-500">Rating: {form[field]}/5</span>
            </label>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.lateNight} onChange={(e) => update("lateNight", e.target.checked)} /> Late-night access</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.foodNearby} onChange={(e) => update("foodNearby", e.target.checked)} /> Food nearby</label>
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700">Tip
          <input className="mt-1 w-full rounded-xl border border-slate-200 p-3" value={form.tips} onChange={(e) => update("tips", e.target.value)} placeholder="Example: Best after 7 PM" />
        </label>

        <button className="mt-6 w-full rounded-2xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700">Add spot</button>
      </motion.form>
    </div>
  );
}

export default function StudyScoutJMU() {
  const [spots, setSpots] = useState(initialSpots);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [noise, setNoise] = useState("All");
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const matchesSearch = `${spot.name} ${spot.area} ${spot.description} ${spot.bestFor.join(" ")}`.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || spot.bestFor.includes(category) || (category === "Food nearby" && spot.foodNearby) || (category === "Late night" && spot.lateNight) || (category === "Low crowd" && spot.crowd === "Low");
      const matchesNoise = noise === "All" || spot.noise === noise;
      return matchesSearch && matchesCategory && matchesNoise;
    });
  }, [spots, search, category, noise]);

  const topSpot = [...spots].sort((a, b) => scoreAverage(b) - scoreAverage(a))[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white text-slate-900">
      <header className="mx-auto max-w-7xl px-5 py-8">
        <nav className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md"><BookOpen /></div>
            <div>
              <h1 className="text-xl font-black tracking-tight">StudyScout JMU</h1>
              <p className="text-xs text-slate-500">Find your campus lock-in spot.</p>
            </div>
          </div>
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-700">
            <Plus size={18} /> Add spot
          </button>
        </nav>

        <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="mb-3 inline-flex rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700">Built for JMU students</p>
            <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Stop guessing where to study on campus.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Rate and discover JMU study spots based on noise, outlets, WiFi, crowd level, comfort, and the all-important lock-in score.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold shadow-sm"><Plug size={17} /> Outlet ratings</span>
              <span className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold shadow-sm"><Users size={17} /> Crowd vibes</span>
              <span className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold shadow-sm"><Moon size={17} /> Late-night picks</span>
              <span className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold shadow-sm"><Coffee size={17} /> Food nearby</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="rounded-3xl border border-purple-100 bg-white p-6 shadow-lg">
            <p className="text-sm font-semibold text-slate-500">Top rated right now</p>
            <h3 className="mt-2 text-2xl font-black">{topSpot.name}</h3>
            <p className="mt-2 text-slate-600">{topSpot.description}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-purple-50 p-4"><p className="text-sm text-purple-700">Overall</p><p className="text-3xl font-black text-purple-800">{scoreAverage(topSpot)}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Crowd</p><p className="text-3xl font-black">{topSpot.crowd}</p></div>
            </div>
          </motion.div>
        </section>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-12">
        <section className="sticky top-0 z-20 mb-6 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Carrier, quiet, outlets, East Campus..." className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-purple-400" />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full appearance-none rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-purple-400">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <select value={noise} onChange={(e) => setNoise(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-400">
              {noiseOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black">Study spots</h2>
          <p className="text-sm text-slate-500">Showing {filteredSpots.length} of {spots.length}</p>
        </div>

        <motion.div layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredSpots.map((spot) => <SpotCard key={spot.id} spot={spot} onOpen={setSelectedSpot} />)}
        </motion.div>

        {filteredSpots.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-10 text-center">
            <h3 className="text-xl font-bold">No spots found</h3>
            <p className="mt-2 text-slate-500">Try changing your filters or adding a new study spot.</p>
          </div>
        )}
      </main>

      {selectedSpot && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setSelectedSpot(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-black">{selectedSpot.name}</h2>
                <p className="mt-1 text-slate-500">{selectedSpot.area} • {selectedSpot.type}</p>
              </div>
              <button onClick={() => setSelectedSpot(null)} className="rounded-full p-2 hover:bg-slate-100"><X /></button>
            </div>
            <p className="leading-7 text-slate-600">{selectedSpot.description}</p>
            <div className="my-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Noise</p><p className="text-xl font-bold">{selectedSpot.noise}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Crowd</p><p className="text-xl font-bold">{selectedSpot.crowd}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Late night</p><p className="text-xl font-bold">{selectedSpot.lateNight ? "Yes" : "No"}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Food nearby</p><p className="text-xl font-bold">{selectedSpot.foodNearby ? "Yes" : "No"}</p></div>
            </div>
            <div className="space-y-3">
              {[["Outlets", selectedSpot.outlets], ["WiFi", selectedSpot.wifi], ["Comfort", selectedSpot.comfort], ["Lock-in score", selectedSpot.productivity]].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <RatingDots value={value} />
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-purple-50 p-4">
              <p className="text-sm font-semibold text-purple-700">Student tip</p>
              <p className="mt-1 text-slate-700">{selectedSpot.tips}</p>
            </div>
          </motion.div>
        </div>
      )}

      {showAddForm && <AddSpotForm onAdd={(spot) => setSpots((current) => [spot, ...current])} onClose={() => setShowAddForm(false)} />}
    </div>
  );
}
