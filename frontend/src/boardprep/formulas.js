// Consolidated formula / quick-reference sheets for last-minute board exam
// revision. Deliberately separate from backend/content/*.json (which holds
// full prose notes) — this is just the bare formulas, definitions and
// reaction types a student needs to glance at the night before the paper.

export const MATHS_FORMULAS = [
  {
    id: "real_numbers",
    title: "Real Numbers",
    items: [
      { f: "a = bq + r, 0 ≤ r < b", d: "Euclid's Division Lemma" },
      { f: "HCF(a,b) × LCM(a,b) = a × b", d: "for two positive integers only" },
      { f: "Every composite number = product of primes, uniquely (up to order)", d: "Fundamental Theorem of Arithmetic" },
      { f: "If p is prime and p | a², then p | a", d: "used to prove √2, √3, √5 … are irrational" },
      { f: "p/q terminates ⇔ q = 2ᵐ × 5ⁿ (m, n ≥ 0)", d: "p/q in lowest terms; otherwise the decimal is non-terminating repeating" }
    ]
  },
  {
    id: "polynomials",
    title: "Polynomials",
    items: [
      { f: "p(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + … + a₁x + a₀, aₙ ≠ 0", d: "general polynomial of degree n" },
      { f: "α + β = -b/a,  αβ = c/a", d: "sum & product of zeroes, quadratic ax²+bx+c" },
      { f: "α+β+γ = -b/a,  αβ+βγ+γα = c/a,  αβγ = -d/a", d: "zeroes of cubic ax³+bx²+cx+d" },
      { f: "p(x) = g(x)·q(x) + r(x)", d: "Division Algorithm — r(x) = 0 or deg r(x) < deg g(x)" }
    ]
  },
  {
    id: "linear_equations_two_variables",
    title: "Pair of Linear Equations in Two Variables",
    items: [
      { f: "a₁x + b₁y + c₁ = 0  and  a₂x + b₂y + c₂ = 0", d: "general pair of linear equations" },
      { f: "a₁/a₂ ≠ b₁/b₂", d: "unique solution — lines intersect" },
      { f: "a₁/a₂ = b₁/b₂ = c₁/c₂", d: "infinitely many solutions — coincident lines" },
      { f: "a₁/a₂ = b₁/b₂ ≠ c₁/c₂", d: "no solution — parallel lines" },
      { f: "x/(b₁c₂-b₂c₁) = y/(c₁a₂-c₂a₁) = 1/(a₁b₂-a₂b₁)", d: "cross-multiplication method" }
    ]
  },
  {
    id: "quadratic_equations",
    title: "Quadratic Equations",
    items: [
      { f: "ax² + bx + c = 0, a ≠ 0", d: "standard form" },
      { f: "x = [-b ± √(b² - 4ac)] / 2a", d: "quadratic formula" },
      { f: "D = b² - 4ac", d: "discriminant" },
      { f: "D > 0 → two distinct real roots;  D = 0 → two equal real roots;  D < 0 → no real roots", d: "nature of roots" },
      { f: "Sum of roots = -b/a,  Product of roots = c/a", d: "" }
    ]
  },
  {
    id: "arithmetic_progressions",
    title: "Arithmetic Progressions",
    items: [
      { f: "aₙ = a + (n-1)d", d: "nth term" },
      { f: "Sₙ = n/2 [2a + (n-1)d]", d: "sum of first n terms" },
      { f: "Sₙ = n/2 (a + l)", d: "sum of first n terms, when last term l is known" },
      { f: "d = aₙ - aₙ₋₁", d: "common difference" }
    ]
  },
  {
    id: "triangles",
    title: "Triangles",
    items: [
      { f: "DE ∥ BC ⇒ AD/DB = AE/EC", d: "Basic Proportionality Theorem (Thales)" },
      { f: "AAA, SSS, SAS", d: "criteria for similarity of triangles" },
      { f: "ar(△ABC)/ar(△PQR) = (AB/PQ)² = (BC/QR)² = (CA/RP)²", d: "areas of similar triangles" },
      { f: "(Hypotenuse)² = (Base)² + (Perpendicular)²", d: "Pythagoras Theorem" },
      { f: "If c² = a² + b², the angle opposite side c is 90°", d: "Converse of Pythagoras Theorem" }
    ]
  },
  {
    id: "coordinate_geometry",
    title: "Coordinate Geometry",
    items: [
      { f: "d = √[(x₂-x₁)² + (y₂-y₁)²]", d: "distance formula" },
      { f: "(x,y) = ( (mx₂+nx₁)/(m+n), (my₂+ny₁)/(m+n) )", d: "section formula, point dividing in ratio m:n internally" },
      { f: "Midpoint = ( (x₁+x₂)/2, (y₁+y₂)/2 )", d: "special case of section formula, m:n = 1:1" },
      { f: "Area = ½ |x₁(y₂-y₃) + x₂(y₃-y₁) + x₃(y₁-y₂)|", d: "area of a triangle from vertex coordinates" }
    ]
  },
  {
    id: "introduction_to_trigonometry",
    title: "Introduction to Trigonometry",
    items: [
      { f: "sinθ = Opp/Hyp,  cosθ = Adj/Hyp,  tanθ = Opp/Adj", d: "primary ratios" },
      { f: "cosecθ = 1/sinθ,  secθ = 1/cosθ,  cotθ = 1/tanθ", d: "reciprocal ratios" },
      { f: "tanθ = sinθ/cosθ,  cotθ = cosθ/sinθ", d: "" },
      { f: "sin²θ + cos²θ = 1", d: "" },
      { f: "1 + tan²θ = sec²θ", d: "" },
      { f: "1 + cot²θ = cosec²θ", d: "" },
      { f: "sin(90°-θ)=cosθ,  cos(90°-θ)=sinθ,  tan(90°-θ)=cotθ,  sec(90°-θ)=cosecθ", d: "complementary angles (and the reverse pairs)" },
      {
        type: "table",
        caption: "Standard angle values",
        headers: ["∠", "0°", "30°", "45°", "60°", "90°"],
        rows: [
          ["sin", "0", "1/2", "1/√2", "√3/2", "1"],
          ["cos", "1", "√3/2", "1/√2", "1/2", "0"],
          ["tan", "0", "1/√3", "1", "√3", "undefined"]
        ]
      }
    ]
  },
  {
    id: "applications_of_trigonometry",
    title: "Some Applications of Trigonometry",
    items: [
      { f: "Angle of elevation", d: "angle between the horizontal and the line of sight, when the object is above the observer" },
      { f: "Angle of depression", d: "angle between the horizontal and the line of sight, when the object is below the observer" },
      { f: "tanθ = height / horizontal distance", d: "typical height-and-distance right-triangle setup" },
      { f: "Angle of elevation = Angle of depression", d: "for the same line of sight, between two points (alternate angles)" }
    ]
  },
  {
    id: "circles",
    title: "Circles",
    items: [
      { f: "Tangent ⊥ radius", d: "at the point of contact" },
      { f: "PA = PB", d: "the two tangents drawn from an external point P to a circle are equal in length" }
    ]
  },
  {
    id: "areas_related_to_circles",
    title: "Areas Related to Circles",
    items: [
      { f: "C = 2πr", d: "circumference of a circle" },
      { f: "A = πr²", d: "area of a circle" },
      { f: "Area of sector = (θ/360°) × πr²", d: "θ = angle of the sector" },
      { f: "Length of arc = (θ/360°) × 2πr", d: "" },
      { f: "Area of segment = Area of sector − Area of corresponding triangle", d: "" },
      { f: "Area of ring (annulus) = π(R² − r²)", d: "R = outer radius, r = inner radius" }
    ]
  },
  {
    id: "surface_areas_volumes",
    title: "Surface Areas and Volumes",
    items: [
      { group: "Cube (side a)" },
      { f: "TSA = 6a²,  Volume = a³", d: "" },
      { group: "Cuboid (l, b, h)" },
      { f: "TSA = 2(lb + bh + hl),  Volume = lbh", d: "" },
      { group: "Cylinder (r, h)" },
      { f: "CSA = 2πrh,  TSA = 2πr(r+h),  Volume = πr²h", d: "" },
      { group: "Cone (r, h, slant l)" },
      { f: "l = √(r²+h²),  CSA = πrl,  TSA = πr(l+r),  Volume = ⅓πr²h", d: "" },
      { group: "Sphere (r)" },
      { f: "Surface Area = 4πr²,  Volume = ⁴⁄₃πr³", d: "" },
      { group: "Hemisphere (r)" },
      { f: "CSA = 2πr²,  TSA = 3πr²,  Volume = ⅔πr³", d: "" },
      { group: "Frustum of a cone (r₁, r₂, h, slant l)" },
      { f: "l = √[h² + (r₁-r₂)²]", d: "" },
      { f: "CSA = π(r₁+r₂)l,  TSA = π(r₁+r₂)l + πr₁² + πr₂²", d: "" },
      { f: "Volume = ⅓πh(r₁² + r₂² + r₁r₂)", d: "" }
    ]
  },
  {
    id: "statistics",
    title: "Statistics",
    items: [
      { f: "Mean = Σfᵢxᵢ / Σfᵢ", d: "direct method" },
      { f: "Mean = a + (Σfᵢdᵢ / Σfᵢ),  dᵢ = xᵢ − a", d: "assumed-mean method" },
      { f: "Mean = a + h × (Σfᵢuᵢ / Σfᵢ),  uᵢ = (xᵢ − a)/h", d: "step-deviation method" },
      { f: "Mode = l + [(f₁ − f₀) / (2f₁ − f₀ − f₂)] × h", d: "l = lower limit of modal class, f₁ its frequency, f₀/f₂ preceding/succeeding class frequency, h = class width" },
      { f: "Median = l + [(n/2 − cf) / f] × h", d: "l = lower limit of median class, cf = cumulative frequency before it, f = its frequency" }
    ]
  },
  {
    id: "probability",
    title: "Probability",
    items: [
      { f: "P(E) = Number of favourable outcomes / Number of all possible equally likely outcomes", d: "" },
      { f: "0 ≤ P(E) ≤ 1", d: "" },
      { f: "P(E) + P(not E) = 1", d: "i.e. P(Ē) = 1 − P(E)" },
      { f: "P(sure event) = 1,  P(impossible event) = 0", d: "" }
    ]
  }
];

export const PHYSICS_FORMULAS = [
  {
    id: "light_reflection_refraction",
    title: "Light — Reflection and Refraction",
    subject: "physics",
    items: [
      { f: "1/v + 1/u = 1/f", d: "mirror formula" },
      { f: "m = h′/h = −v/u", d: "magnification, spherical mirror" },
      { f: "1/v − 1/u = 1/f", d: "lens formula" },
      { f: "m = h′/h = v/u", d: "magnification, lens" },
      { f: "P = 1/f", d: "power of a lens (f in metres); unit dioptre (D); convex +ve, concave −ve" },
      { f: "n = sin i / sin r", d: "Snell's law — refractive index" },
      { f: "n₂₁ = n₂/n₁ = speed of light in medium 1 / speed of light in medium 2", d: "relative refractive index" }
    ]
  },
  {
    id: "human_eye_colourful_world",
    title: "The Human Eye and the Colourful World",
    subject: "physics",
    items: [
      { f: "Near point ≈ 25 cm, Far point = infinity", d: "for a normal human eye" },
      { f: "Myopia (near-sightedness)", d: "image forms before the retina — corrected with a concave (diverging) lens" },
      { f: "Hypermetropia (far-sightedness)", d: "image forms behind the retina — corrected with a convex (converging) lens" },
      { f: "Presbyopia", d: "corrected with bifocal lenses (concave on top, convex at the bottom, or vice versa)" },
      { f: "Scattering of light → Tyndall effect", d: "explains the blue sky, reddish sun at sunrise/sunset" }
    ]
  },
  {
    id: "electricity",
    title: "Electricity",
    subject: "physics",
    items: [
      { f: "V = IR", d: "Ohm's Law" },
      { f: "R = ρl/A", d: "resistance in terms of resistivity ρ, length l, area A" },
      { f: "R = R₁ + R₂ + R₃ + …", d: "resistors in series — same current, V = V₁+V₂+V₃" },
      { f: "1/R = 1/R₁ + 1/R₂ + 1/R₃ + …", d: "resistors in parallel — same voltage, I = I₁+I₂+I₃" },
      { f: "I = Q/t", d: "electric current" },
      { f: "P = VI = I²R = V²/R", d: "electric power" },
      { f: "W = Pt = VIt", d: "electrical energy; 1 kWh (\"1 unit\") = 3.6 × 10⁶ J" },
      { f: "V = W/Q", d: "potential difference" }
    ]
  },
  {
    id: "magnetic_effects_current",
    title: "Magnetic Effects of Electric Current",
    subject: "physics",
    items: [
      { f: "Right-hand thumb rule", d: "gives the direction of the magnetic field around a current-carrying straight conductor" },
      { f: "F = BIl sinθ  (F = BIl when θ = 90°)", d: "force on a current-carrying conductor in a magnetic field" },
      { f: "Fleming's Left-Hand Rule", d: "direction of force on a current-carrying conductor (motor effect)" },
      { f: "Fleming's Right-Hand Rule", d: "direction of induced current (generator effect / electromagnetic induction)" },
      { f: "Magnetic field inside a solenoid is uniform, parallel to its axis", d: "a solenoid behaves like a bar magnet" }
    ]
  },
  {
    id: "sources_of_energy",
    title: "Sources of Energy",
    subject: "physics",
    items: [
      { f: "Efficiency = (useful energy output / total energy input) × 100%", d: "" },
      { f: "Renewable: solar, wind, water, biomass, geothermal, tidal, ocean thermal", d: "" },
      { f: "Non-renewable: fossil fuels (coal, petroleum, natural gas), nuclear fuel", d: "" },
      { f: "Higher calorific value ⇒ more energy released per kg on combustion", d: "used to compare fuels" }
    ]
  }
];

export const CHEMISTRY_FORMULAS = [
  {
    id: "chemical_reactions_equations",
    title: "Chemical Reactions and Equations",
    subject: "chemistry",
    items: [
      { f: "A + B → AB", d: "combination reaction" },
      { f: "AB → A + B", d: "decomposition reaction (thermal / electrolytic / photolytic)" },
      { f: "A + BC → AC + B", d: "displacement reaction" },
      { f: "AB + CD → AD + CB", d: "double displacement reaction (often forms a precipitate)" },
      { f: "Oxidation = gain of oxygen / loss of hydrogen / loss of electrons", d: "" },
      { f: "Reduction = loss of oxygen / gain of hydrogen / gain of electrons", d: "" },
      { f: "Redox reaction", d: "oxidation and reduction occurring together (one reactant oxidised, the other reduced)" },
      { f: "Balance using the Law of Conservation of Mass", d: "adjust coefficients only, never subscripts" }
    ]
  },
  {
    id: "acids_bases_salts",
    title: "Acids, Bases and Salts",
    subject: "chemistry",
    items: [
      { f: "pH = −log[H⁺]", d: "pH scale 0–14; pH < 7 acidic, pH = 7 neutral, pH > 7 basic" },
      { f: "Acid + Base → Salt + Water", d: "neutralisation" },
      { f: "Acid + Metal → Salt + H₂↑", d: "" },
      { f: "Acid + Metal carbonate / bicarbonate → Salt + H₂O + CO₂↑", d: "" },
      { f: "Base + Metal (e.g. Zn) → Salt + H₂↑", d: "" },
      {
        type: "table",
        caption: "Common compounds to remember",
        headers: ["Compound", "Formula"],
        rows: [
          ["Baking soda", "NaHCO₃"],
          ["Washing soda", "Na₂CO₃·10H₂O"],
          ["Bleaching powder", "CaOCl₂"],
          ["Common salt", "NaCl"],
          ["Blue vitriol", "CuSO₄·5H₂O"],
          ["Gypsum", "CaSO₄·2H₂O"],
          ["Plaster of Paris", "CaSO₄·½H₂O"]
        ]
      }
    ]
  },
  {
    id: "metals_non_metals",
    title: "Metals and Non-metals",
    subject: "chemistry",
    items: [
      { f: "K > Na > Ca > Mg > Al > Zn > Fe > Pb > (H) > Cu > Hg > Ag > Au", d: "reactivity series (most to least reactive)" },
      { f: "Metal + O₂ → Metal oxide (basic)", d: "non-metal oxides are acidic" },
      { f: "Metal + dilute acid → Salt + H₂↑", d: "" },
      { f: "Ionic (electrovalent) compounds", d: "formed by transfer of electrons from a metal to a non-metal" },
      { f: "4Fe + 3O₂ + xH₂O → 2Fe₂O₃·xH₂O", d: "rusting of iron (corrosion); prevented by galvanisation, painting, oiling, alloying" }
    ]
  },
  {
    id: "carbon_compounds",
    title: "Carbon and its Compounds",
    subject: "chemistry",
    items: [
      { f: "Catenation", d: "carbon's unique ability to form covalent bonds with other carbon atoms, giving long chains/rings" },
      { f: "CₙH₂ₙ₊₂ — Alkanes (saturated)", d: "" },
      { f: "CₙH₂ₙ — Alkenes (one double bond, unsaturated)", d: "" },
      { f: "CₙH₂ₙ₋₂ — Alkynes (one triple bond, unsaturated)", d: "" },
      {
        type: "table",
        caption: "Functional groups",
        headers: ["Group", "Class"],
        rows: [
          ["–OH", "Alcohol"],
          ["–CHO", "Aldehyde"],
          ["–COOH", "Carboxylic acid"],
          ["–CO–", "Ketone"],
          ["–X (Cl/Br/I)", "Haloalkane"]
        ]
      },
      { f: "CₓHᵧ + O₂ → CO₂ + H₂O", d: "combustion (complete); saturated hydrocarbons burn with a clean blue flame" },
      { f: "Alcohol + Carboxylic acid → Ester + Water", d: "esterification, in presence of conc. H₂SO₄ — esters have a fruity smell" },
      { f: "Ester + NaOH → Soap + Alcohol", d: "saponification" }
    ]
  }
];

export const FORMULA_SHEETS = {
  maths: { label: "Mathematics", chapters: MATHS_FORMULAS },
  science: { label: "Science — Physics & Chemistry", chapters: [...PHYSICS_FORMULAS, ...CHEMISTRY_FORMULAS] }
};
