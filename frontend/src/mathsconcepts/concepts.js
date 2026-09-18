// Class X Mathematics — "Main Concepts and Results" section reproduced from
// the NCERT Exemplar Problems book for each chapter (the prose summary NCERT
// prints at the start of every chapter, before the practice questions).
// Source: https://ncert.nic.in/exemplar-problems.php?ln=en (Class X, Mathematics).

export const MATHS_CONCEPTS = [
  {
    id: "real_numbers",
    title: "Chapter 1 — Real Numbers",
    groups: [
      {
        points: [
          "Euclid's Division Lemma: Given two positive integers a and b, there exist unique integers q and r satisfying a = bq + r, 0 ≤ r < b.",
          {
            text: "Euclid's Division Algorithm to obtain the HCF of two positive integers, say c and d, c > d:",
            sub: [
              "Step 1: Apply Euclid's division lemma to c and d, to find whole numbers q and r, such that c = dq + r, 0 ≤ r < d.",
              "Step 2: If r = 0, d is the HCF of c and d. If r ≠ 0, apply the division lemma to d and r.",
              "Step 3: Continue the process till the remainder is zero. The divisor at this stage will be the required HCF."
            ]
          },
          "Fundamental Theorem of Arithmetic: Every composite number can be expressed as a product of primes, and this expression (factorisation) is unique, apart from the order in which the prime factors occur.",
          "Let p be a prime number. If p divides a², then p divides a, where a is a positive integer.",
          "√2, √3, √5 are irrational numbers.",
          "The sum or difference of a rational and an irrational number is irrational.",
          "The product or quotient of a non-zero rational number and an irrational number is irrational.",
          "For any two positive integers a and b, HCF(a, b) × LCM(a, b) = a × b.",
          "Let x = p/q, p and q co-prime, be a rational number whose decimal expansion terminates. Then the prime factorisation of q is of the form 2ᵐ·5ⁿ; m, n are non-negative integers.",
          "Let x = p/q be a rational number such that the prime factorisation of q is not of the form 2ᵐ·5ⁿ. Then x has a non-terminating repeating decimal expansion."
        ]
      }
    ]
  },
  {
    id: "polynomials",
    title: "Chapter 2 — Polynomials",
    groups: [
      {
        points: [
          "Geometrical meaning of zeroes of a polynomial: the zeroes of a polynomial p(x) are precisely the x-coordinates of the points where the graph of y = p(x) intersects the x-axis.",
          "Relation between the zeroes and coefficients of a quadratic polynomial ax² + bx + c: if α and β are its zeroes, then α + β = −b/a, αβ = c/a.",
          "If α, β and γ are the zeroes of a cubic polynomial ax³ + bx² + cx + d, then α+β+γ = −b/a, αβ+βγ+γα = c/a, and αβγ = −d/a.",
          "Division Algorithm: given any polynomial p(x) and any non-zero polynomial g(x), there are polynomials q(x) and r(x) such that p(x) = g(x)·q(x) + r(x), where r(x) = 0 or degree r(x) < degree g(x)."
        ]
      }
    ]
  },
  {
    id: "linear_equations_two_variables",
    title: "Chapter 3 — Pair of Linear Equations in Two Variables",
    groups: [
      {
        points: [
          "Two linear equations in the same two variables are said to form a pair of linear equations in two variables. The most general form is a₁x + b₁y + c₁ = 0 and a₂x + b₂y + c₂ = 0, where a₁, a₂, b₁, b₂, c₁, c₂ are real numbers such that a₁²+b₁² ≠ 0 and a₂²+b₂² ≠ 0.",
          "A pair of linear equations is consistent if it has a solution — either a unique solution or infinitely many. Infinitely many solutions means the pair is dependent (and consistent).",
          "A pair of linear equations is inconsistent if it has no solution.",
          {
            text: "For a pair a₁x + b₁y + c₁ = 0 and a₂x + b₂y + c₂ = 0:",
            sub: [
              "a₁/a₂ ≠ b₁/b₂ → consistent, unique solution; graph is a pair of intersecting lines.",
              "a₁/a₂ = b₁/b₂ ≠ c₁/c₂ → inconsistent, no solution; graph is a pair of parallel lines.",
              "a₁/a₂ = b₁/b₂ = c₁/c₂ → dependent and consistent, infinitely many solutions; graph is a pair of coincident lines."
            ]
          },
          "A pair of linear equations can be solved algebraically by the Substitution Method, the Elimination Method, or the Cross-multiplication Method.",
          "The pair of linear equations can also be solved geometrically/graphically."
        ]
      }
    ]
  },
  {
    id: "quadratic_equations",
    title: "Chapter 4 — Quadratic Equations",
    groups: [
      {
        points: [
          "A quadratic equation in the variable x is of the form ax² + bx + c = 0, where a, b, c are real numbers and a ≠ 0.",
          "A real number α is said to be a root of ax² + bx + c = 0 if aα² + bα + c = 0. The roots of ax² + bx + c = 0 are the same as the zeroes of the quadratic polynomial ax² + bx + c.",
          "Finding roots by factorisation: if the quadratic polynomial ax² + bx + c can be factorised, its roots are found by equating each linear factor to zero.",
          "Finding roots by completing the square: by adding and subtracting a suitable constant, the x² and x terms are made into a complete square, and solved for x.",
          "Quadratic Formula: if b² − 4ac ≥ 0, the roots of ax² + bx + c = 0 are given by x = [−b ± √(b² − 4ac)] / 2a. The expression b² − 4ac is called the discriminant of the quadratic equation.",
          {
            text: "Nature of roots of ax² + bx + c = 0:",
            sub: [
              "two distinct real roots if b² − 4ac > 0",
              "two equal real roots if b² − 4ac = 0",
              "no real roots if b² − 4ac < 0"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "arithmetic_progressions",
    title: "Chapter 5 — Arithmetic Progressions",
    groups: [
      {
        points: [
          "An arithmetic progression (AP) is a list of numbers in which each term is obtained by adding a fixed number d (the common difference) to the preceding term, except the first term a. The general form of an AP is a, a+d, a+2d, a+3d, …",
          "In the list a₁, a₂, a₃, … , if the differences a₂−a₁, a₃−a₂, a₄−a₃, … all give the same value — i.e. aₖ₊₁ − aₖ is the same for every k — then the list is an AP.",
          "The nth term (general term) of an AP is aₙ = a + (n−1)d, where a is the first term and d is the common difference. Note that a₁ = a.",
          "The sum Sₙ of the first n terms of an AP is Sₙ = n/2 [2a + (n−1)d]. If l is the last term of an AP of n terms, then Sₙ = n/2 [a + l].",
          "If Sₙ is the sum of the first n terms of an AP, its nth term is aₙ = Sₙ − Sₙ₋₁."
        ]
      }
    ]
  },
  {
    id: "triangles",
    title: "Chapter 6 — Triangles",
    groups: [
      {
        points: [
          "Congruence and similarity, conditions for similarity of two polygons, similarity of triangles, similarity and correspondence of vertices. Criteria for similarity of triangles: (i) AAA or AA (ii) SSS (iii) SAS.",
          "Basic Proportionality Theorem (Thales) and its converse: if a line is drawn parallel to one side of a triangle to intersect the other two sides, then these two sides are divided in the same ratio.",
          "Ratio of the areas of two similar triangles is equal to the ratio of the squares of their corresponding sides.",
          "The perpendicular drawn from the vertex of the right angle of a right triangle to its hypotenuse divides the triangle into two triangles which are similar to the whole triangle and to each other.",
          "Pythagoras Theorem and its converse: in a right triangle, the square on the hypotenuse is equal to the sum of the squares on the other two sides."
        ]
      }
    ]
  },
  {
    id: "coordinate_geometry",
    title: "Chapter 7 — Coordinate Geometry",
    groups: [
      {
        points: [
          "Distance Formula: the distance between two points P(x₁,y₁) and Q(x₂,y₂) is √[(x₂−x₁)² + (y₂−y₁)²]. The distance of a point P(x,y) from the origin is √(x² + y²).",
          "Section Formula: the coordinates of the point P which divides the line segment joining A(x₁,y₁) and B(x₂,y₂) internally in the ratio m₁:m₂ are ((m₁x₂+m₂x₁)/(m₁+m₂), (m₁y₂+m₂y₁)/(m₁+m₂)).",
          "Midpoint of the segment joining P(x₁,y₁) and Q(x₂,y₂) is ((x₁+x₂)/2, (y₁+y₂)/2).",
          "Area of a Triangle with vertices A(x₁,y₁), B(x₂,y₂), C(x₃,y₃) is ½ |x₁(y₂−y₃) + x₂(y₃−y₁) + x₃(y₁−y₂)|, which is non-zero unless A, B and C are collinear."
        ]
      }
    ]
  },
  {
    id: "introduction_to_trigonometry",
    title: "Chapter 8 — Introduction to Trigonometry and its Applications",
    groups: [
      {
        points: [
          {
            text: "Trigonometric ratios of ∠A in a triangle ABC right-angled at B:",
            sub: [
              "sin A = (side opposite A)/hypotenuse = BC/AC",
              "cos A = (side adjacent to A)/hypotenuse = AB/AC",
              "tan A = (side opposite A)/(side adjacent to A) = BC/AB",
              "cosec A = 1/sin A = AC/BC,  sec A = 1/cos A = AC/AB,  cot A = 1/tan A = AB/BC",
              "tan A = sin A / cos A,  cot A = cos A / sin A"
            ]
          },
          "The values of the trigonometric ratios of an angle do not vary with the lengths of the sides of the triangle, if the angle remains the same. If one trigonometric ratio of an angle is given, the other ratios can be determined.",
          {
            type: "table",
            caption: "Trigonometric ratios of 0°, 30°, 45°, 60°, 90°",
            headers: ["∠A", "0°", "30°", "45°", "60°", "90°"],
            rows: [
              ["sin A", "0", "1/2", "1/√2", "√3/2", "1"],
              ["cos A", "1", "√3/2", "1/√2", "1/2", "0"],
              ["tan A", "0", "1/√3", "1", "√3", "not defined"],
              ["cosec A", "not defined", "2", "√2", "2/√3", "1"],
              ["sec A", "1", "2/√3", "√2", "2", "not defined"],
              ["cot A", "not defined", "√3", "1", "1/√3", "0"]
            ]
          },
          "The value of sin A or cos A never exceeds 1, whereas sec A or cosec A is always greater than or equal to 1.",
          "Complementary angles: sin(90°−A) = cos A, cos(90°−A) = sin A, tan(90°−A) = cot A, cot(90°−A) = tan A, sec(90°−A) = cosec A, cosec(90°−A) = sec A.",
          "Trigonometric identities: cos²A + sin²A = 1;  1 + tan²A = sec²A;  cot²A + 1 = cosec²A.",
          "The 'line of sight' is the line from the eye of an observer to the point on the object viewed. The 'angle of elevation' of an object is the angle formed by the line of sight with the horizontal when the object is above the horizontal level; the 'angle of depression' is the corresponding angle when the object is below the horizontal level.",
          "The height or length of an object, or the distance between two distinct objects, can be determined with the help of trigonometric ratios."
        ]
      }
    ]
  },
  {
    id: "circles",
    title: "Chapter 9 — Circles",
    groups: [
      {
        points: [
          "The meaning of a tangent and its point of contact on a circle.",
          "A tangent is perpendicular to the radius through the point of contact.",
          "Only two tangents can be drawn to a circle from an external point.",
          "The lengths of the two tangents from an external point to a circle are equal."
        ]
      }
    ]
  },
  {
    id: "constructions",
    title: "Chapter 10 — Constructions",
    groups: [
      {
        points: [
          "Division of a line segment internally in a given ratio.",
          "Construction of a triangle similar to a given triangle, as per a given scale factor which may be less than 1 or greater than 1.",
          "Construction of the pair of tangents from an external point to a circle."
        ]
      }
    ]
  },
  {
    id: "areas_related_to_circles",
    title: "Chapter 11 — Areas Related to Circles",
    groups: [
      {
        points: [
          "Perimeters and areas of simple closed figures. Circumference and area of a circle. Area of a circular path (i.e. a ring). Sector of a circle and its central angle — major and minor sectors. Segment of a circle — major and minor segments.",
          "Circumference of a circle = 2πr and area of a circle = πr², where r is the radius.",
          "Area of the circular path (ring) formed by two concentric circles of radii r₁ and r₂ (r₁ > r₂) = π(r₁² − r₂²).",
          "Area of the sector of a circle of radius r with central angle θ (in degrees) = (θ/360°) × πr².",
          "Length of the arc of a sector of radius r with central angle θ (in degrees) = (θ/360°) × 2πr.",
          "Area of the minor segment of a circle = area of the sector − area of the corresponding triangle.",
          "Area of the major sector of a circle of radius r = πr² − area of the corresponding minor sector.",
          "Area of the major segment of a circle of radius r = πr² − area of the corresponding minor segment.",
          "Note: unless stated otherwise, take π = 22/7."
        ]
      }
    ]
  },
  {
    id: "surface_areas_volumes",
    title: "Chapter 12 — Surface Areas and Volumes",
    groups: [
      {
        points: [
          "The surface area of a solid formed by combining any two of the basic solids — cuboid, cone, cylinder, sphere and hemisphere.",
          "The volume of a solid formed by combining any two of the basic solids — cuboid, cone, cylinder, sphere and hemisphere.",
          {
            text: "Frustum of a cone (radii r₁, r₂, vertical height h, slant height l, where l = √[h² + (r₁−r₂)²]):",
            sub: [
              "Volume of the frustum = (1/3)πh(r₁² + r₂² + r₁r₂)",
              "Curved surface area of the frustum = π(r₁+r₂)l",
              "Total surface area of the frustum = πl(r₁+r₂) + πr₁² + πr₂²"
            ]
          },
          {
            text: "Solid hemisphere of radius r:",
            sub: [
              "Curved surface area = 2πr²",
              "Total surface area = 3πr²",
              "Volume = (2/3)πr³"
            ]
          },
          "Volume of a spherical shell = (4/3)π(r₂³ − r₁³), where r₂ and r₁ are respectively its external and internal radii.",
          "Throughout this chapter, take π = 22/7 unless stated otherwise."
        ]
      }
    ]
  },
  {
    id: "statistics_probability",
    title: "Chapter 13 — Statistics and Probability",
    groups: [
      {
        heading: "Statistics — Measures of Central Tendency",
        points: [
          {
            text: "(a) Mean of grouped data — the frequency of each class interval is assumed to be centred at its mid-point:",
            sub: [
              "Direct Method: Mean = Σfᵢxᵢ / Σfᵢ, where xᵢ (the class mark) is the mid-point of the ith class interval and fᵢ is its frequency.",
              "Assumed Mean Method: Mean = a + (Σfᵢdᵢ / Σfᵢ), where a is the assumed mean and dᵢ = xᵢ − a.",
              "Step-deviation Method: Mean = a + h × (Σfᵢuᵢ / Σfᵢ), where a is the assumed mean, h is the class size, and uᵢ = (xᵢ − a)/h.",
              "If the class sizes are unequal, the step-deviation formula can still be applied by taking h to be a suitable divisor of all the dᵢ's."
            ]
          },
          {
            text: "(b) Mode of grouped data:",
            sub: [
              "The modal class is the class interval with the maximum frequency; the mode is a value inside this class.",
              "Mode = l + [(f₁ − f₀) / (2f₁ − f₀ − f₂)] × h, where l is the lower limit of the modal class, h is the class size, f₁ is the frequency of the modal class, and f₀, f₂ are the frequencies of the classes preceding and succeeding it."
            ]
          },
          {
            text: "(c) Median of grouped data:",
            sub: [
              "Using a cumulative frequency table (less-than type or more-than type), the median class is the class whose cumulative frequency is greater than (and nearest to) n/2.",
              "Median = l + [(n/2 − cf) / f] × h, where l is the lower limit of the median class, n is the number of observations, h is the class size, cf is the cumulative frequency of the class preceding the median class, and f is the frequency of the median class."
            ]
          },
          {
            text: "(d) Graphical representation of cumulative frequency distribution (ogive) — less-than type and more-than type:",
            sub: [
              "The median can be read from the graph of the less-than type ogive, at cumulative frequency n/2.",
              "The median can also be found as the x-coordinate of the point of intersection of the less-than type and more-than type ogives."
            ]
          }
        ]
      },
      {
        heading: "Probability",
        points: [
          "Random experiment, outcome of an experiment, event, elementary events, and equally likely outcomes.",
          "The theoretical (classical) probability of an event E, P(E), is (number of outcomes favourable to E) / (number of all possible outcomes of the experiment), where the outcomes are equally likely.",
          "The probability of an event can be any number between 0 and 1 (including 0 or 1 in special cases). The sum of the probabilities of all the elementary events of an experiment is 1.",
          "For an event E, P(E) + P(not E) = 1, i.e. P(Ē) = 1 − P(E), where Ē (the complement of E) is the event 'not E'.",
          "Impossible event: P = 0.  Sure/certain event: P = 1."
        ]
      }
    ]
  }
];
