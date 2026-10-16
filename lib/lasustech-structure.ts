export interface Course {
  id: string;
  code: string;
  title: string;
  level: string;
  sem: string;
  lecturers: string[];
  status: "Active" | "Archived";
}

export interface Programme {
  id: string;
  name: string;
  degree: string;
  levels: string[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  programmes: Programme[];
  courses: Course[];
}

export interface College {
  id: string;
  name: string;
  code: string;
  tag?: string;
  dean: string;
  departments: Department[];
}

export const LASUSTECH_COLLEGES: College[] = [
  {
    id: "col_agr",
    name: "College of Agriculture",
    code: "AGR",
    tag: "AGR",
    dean: "Prof. K. A. Adeleke",
    departments: [
      {
        id: "dept_aefm",
        name: "Agricultural Economics and Farm Management",
        code: "AEFM",
        head: "Dr. A. O. Oladipo",
        programmes: [
          {
            id: "prog_aefm",
            name: "B.Agric. Agricultural Economics & Farm Management",
            degree: "B.Agric.",
            levels: ["100 level", "200 level", "300 level", "400 level", "500 level"],
          },
        ],
        courses: [
          { id: "c_aef201", code: "AEF 201", title: "Principles of Agricultural Economics", level: "200", sem: "1st", lecturers: ["Dr. A. O. Oladipo"], status: "Active" },
          { id: "c_aef301", code: "AEF 301", title: "Farm Management and Accounting", level: "300", sem: "1st", lecturers: ["Dr. A. O. Oladipo"], status: "Active" },
        ],
      },
      {
        id: "dept_aerd",
        name: "Agricultural Extension and Rural Development",
        code: "AERD",
        head: "Dr. (Mrs.) R. M. Sanni",
        programmes: [
          {
            id: "prog_aerd",
            name: "B.Agric. Agricultural Extension & Rural Development",
            degree: "B.Agric.",
            levels: ["100 level", "200 level", "300 level", "400 level", "500 level"],
          },
        ],
        courses: [
          { id: "c_aex201", code: "AEX 201", title: "Introduction to Agricultural Extension", level: "200", sem: "1st", lecturers: ["Dr. R. M. Sanni"], status: "Active" },
        ],
      },
      {
        id: "dept_anp",
        name: "Animal Production",
        code: "ANP",
        head: "Dr. B. E. Babalola",
        programmes: [
          {
            id: "prog_anp",
            name: "B.Agric. Animal Production",
            degree: "B.Agric.",
            levels: ["100 level", "200 level", "300 level", "400 level", "500 level"],
          },
        ],
        courses: [
          { id: "c_anp201", code: "ANP 201", title: "Introduction to Animal Agriculture", level: "200", sem: "1st", lecturers: ["Dr. B. E. Babalola"], status: "Active" },
          { id: "c_anp301", code: "ANP 301", title: "Ruminant Animal Management", level: "300", sem: "1st", lecturers: ["Dr. B. E. Babalola"], status: "Active" },
        ],
      },
      {
        id: "dept_crp",
        name: "Crop Protection",
        code: "CRP",
        head: "Dr. J. T. Alamu",
        programmes: [
          {
            id: "prog_crp",
            name: "B.Agric. Crop Protection",
            degree: "B.Agric.",
            levels: ["100 level", "200 level", "300 level", "400 level", "500 level"],
          },
        ],
        courses: [
          { id: "c_crp201", code: "CRP 201", title: "Crop Anatomy and Physiology", level: "200", sem: "1st", lecturers: ["Dr. J. T. Alamu"], status: "Active" },
        ],
      },
      {
        id: "dept_faq",
        name: "Fisheries and Aquaculture",
        code: "FAQ",
        head: "Dr. M. K. Lawal",
        programmes: [
          {
            id: "prog_faq",
            name: "B.Fisheries Fisheries and Aquaculture",
            degree: "B.Fisheries",
            levels: ["100 level", "200 level", "300 level", "400 level", "500 level"],
          },
        ],
        courses: [
          { id: "c_faq201", code: "FAQ 201", title: "Principles of Aquaculture", level: "200", sem: "1st", lecturers: ["Dr. M. K. Lawal"], status: "Active" },
        ],
      },
      {
        id: "dept_hlm",
        name: "Horticulture and Landscape Management",
        code: "HLM",
        head: "Dr. O. A. Ajayi",
        programmes: [
          {
            id: "prog_hlm",
            name: "B.Agric. Horticulture & Landscape Management",
            degree: "B.Agric.",
            levels: ["100 level", "200 level", "300 level", "400 level", "500 level"],
          },
        ],
        courses: [
          { id: "c_hlm201", code: "HLM 201", title: "Introduction to Horticulture", level: "200", sem: "1st", lecturers: ["Dr. O. A. Ajayi"], status: "Active" },
        ],
      },
    ],
  },
  {
    id: "col_cedt",
    name: "College of Environmental Design and Technology",
    code: "CEDT",
    tag: "CEDT",
    dean: "Prof. A. S. Mustapha",
    departments: [
      {
        id: "dept_arc",
        name: "Architecture",
        code: "ARC",
        head: "Arc. D. M. Shonibare",
        programmes: [
          {
            id: "prog_arc",
            name: "B.Sc. Architecture",
            degree: "B.Sc.",
            levels: ["100 level", "200 level", "300 level", "400 level"],
          },
        ],
        courses: [
          { id: "c_arc201", code: "ARC 201", title: "Architectural Graphics I", level: "200", sem: "1st", lecturers: ["Arc. D. M. Shonibare"], status: "Active" },
          { id: "c_arc301", code: "ARC 301", title: "Building Climatology", level: "300", sem: "1st", lecturers: ["Arc. D. M. Shonibare"], status: "Active" },
        ],
      },
      {
        id: "dept_aid",
        name: "Art and Industrial Design",
        code: "AID",
        head: "Dr. S. O. Ogundele",
        programmes: [
          {
            id: "prog_aid",
            name: "B.A. Fine & Applied Arts / Industrial Design",
            degree: "B.A.",
            levels: ["100 level", "200 level", "300 level", "400 level"],
          },
        ],
        courses: [
          { id: "c_aid201", code: "AID 201", title: "Introduction to Industrial Design", level: "200", sem: "1st", lecturers: ["Dr. S. O. Ogundele"], status: "Active" },
        ],
      },
      {
        id: "dept_bld",
        name: "Building Technology",
        code: "BLD",
        head: "Bldr. E. O. Coker",
        programmes: [
          {
            id: "prog_bld",
            name: "B.Sc. Building Technology",
            degree: "B.Sc.",
            levels: ["100 level", "200 level", "300 level", "400 level", "500 level"],
          },
        ],
        courses: [
          { id: "c_bld201", code: "BLD 201", title: "Building Construction I", level: "200", sem: "1st", lecturers: ["Bldr. E. O. Coker"], status: "Active" },
        ],
      },
      {
        id: "dept_emv",
        name: "Estate Management and Valuation",
        code: "EMV",
        head: "ESV. K. B. Williams",
        programmes: [
          {
            id: "prog_emv",
            name: "B.Sc. Estate Management & Valuation",
            degree: "B.Sc.",
            levels: ["100 level", "200 level", "300 level", "400 level"],
          },
        ],
        courses: [
          { id: "c_emv201", code: "EMV 201", title: "Principles of Valuation I", level: "200", sem: "1st", lecturers: ["ESV. K. B. Williams"], status: "Active" },
        ],
      },
      {
        id: "dept_qsv",
        name: "Quantity Surveying",
        code: "QSV",
        head: "QS. T. A. Badmus",
        programmes: [
          {
            id: "prog_qsv",
            name: "B.Sc. Quantity Surveying",
            degree: "B.Sc.",
            levels: ["100 level", "200 level", "300 level", "400 level", "500 level"],
          },
        ],
        courses: [
          { id: "c_qsv201", code: "QSV 201", title: "Measurement of Building Works I", level: "200", sem: "1st", lecturers: ["QS. T. A. Badmus"], status: "Active" },
        ],
      },
      {
        id: "dept_urp",
        name: "Urban and Regional Planning",
        code: "URP",
        head: "Tpl. H. O. Balogun",
        programmes: [
          {
            id: "prog_urp",
            name: "B.Sc. Urban & Regional Planning",
            degree: "B.Sc.",
            levels: ["100 level", "200 level", "300 level", "400 level", "500 level"],
          },
        ],
        courses: [
          { id: "c_urp201", code: "URP 201", title: "Introduction to Town Planning", level: "200", sem: "1st", lecturers: ["Tpl. H. O. Balogun"], status: "Active" },
        ],
      },
    ],
  },
  {
    id: "col_cass",
    name: "College of Applied Social Sciences",
    code: "CASS",
    tag: "CASS",
    dean: "Prof. M. B. Fashina",
    departments: [
      {
        id: "dept_acc",
        name: "Accounting",
        code: "ACC",
        head: "Dr. O. M. Tijani",
        programmes: [
          { id: "prog_acc", name: "B.Sc. Accounting", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_acc201", code: "ACC 201", title: "Financial Accounting I", level: "200", sem: "1st", lecturers: ["Dr. O. M. Tijani"], status: "Active" },
          { id: "c_acc301", code: "ACC 301", title: "Management Accounting", level: "300", sem: "1st", lecturers: ["Dr. O. M. Tijani"], status: "Active" },
        ],
      },
      {
        id: "dept_bnf",
        name: "Banking and Finance",
        code: "BNF",
        head: "Dr. A. L. Yusuf",
        programmes: [
          { id: "prog_bnf", name: "B.Sc. Banking and Finance", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_bnf201", code: "BNF 201", title: "Money and Banking", level: "200", sem: "1st", lecturers: ["Dr. A. L. Yusuf"], status: "Active" },
        ],
      },
      {
        id: "dept_bad",
        name: "Business Administration",
        code: "BAD",
        head: "Dr. F. K. Sanusi",
        programmes: [
          { id: "prog_bad", name: "B.Sc. Business Administration", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_bad201", code: "BAD 201", title: "Principles of Management", level: "200", sem: "1st", lecturers: ["Dr. F. K. Sanusi"], status: "Active" },
        ],
      },
      {
        id: "dept_eco",
        name: "Economics",
        code: "ECO",
        head: "Dr. I. O. Popoola",
        programmes: [
          { id: "prog_eco", name: "B.Sc. Economics", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_eco201", code: "ECO 201", title: "Microeconomic Theory I", level: "200", sem: "1st", lecturers: ["Dr. I. O. Popoola"], status: "Active" },
        ],
      },
      {
        id: "dept_htm",
        name: "Hospitality and Tourism Management",
        code: "HTM",
        head: "Dr. (Mrs.) Y. A. Bakare",
        programmes: [
          { id: "prog_htm", name: "B.Sc. Hospitality & Tourism Management", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_htm201", code: "HTM 201", title: "Introduction to Hospitality Management", level: "200", sem: "1st", lecturers: ["Dr. Y. A. Bakare"], status: "Active" },
        ],
      },
      {
        id: "dept_ias",
        name: "Insurance and Actuarial Science",
        code: "IAS",
        head: "Dr. T. G. Sowunmi",
        programmes: [
          { id: "prog_ias", name: "B.Sc. Insurance & Actuarial Science", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_ias201", code: "IAS 201", title: "Principles of Insurance", level: "200", sem: "1st", lecturers: ["Dr. T. G. Sowunmi"], status: "Active" },
        ],
      },
      {
        id: "dept_mkt",
        name: "Marketing",
        code: "MKT",
        head: "Dr. R. O. Dosunmu",
        programmes: [
          { id: "prog_mkt", name: "B.Sc. Marketing", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_mkt201", code: "MKT 201", title: "Principles of Marketing", level: "200", sem: "1st", lecturers: ["Dr. R. O. Dosunmu"], status: "Active" },
        ],
      },
      {
        id: "dept_mac",
        name: "Mass Communication",
        code: "MAC",
        head: "Dr. G. A. Adegoke",
        programmes: [
          { id: "prog_mac", name: "B.Sc. Mass Communication", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_mac201", code: "MAC 201", title: "Introduction to Mass Communication", level: "200", sem: "1st", lecturers: ["Dr. G. A. Adegoke"], status: "Active" },
        ],
      },
      {
        id: "dept_oim",
        name: "Office and Information Management",
        code: "OIM",
        head: "Dr. (Mrs.) B. T. Olusanya",
        programmes: [
          { id: "prog_oim", name: "B.Sc. Office & Information Management", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_oim201", code: "OIM 201", title: "Office Administration & Practice", level: "200", sem: "1st", lecturers: ["Dr. B. T. Olusanya"], status: "Active" },
        ],
      },
    ],
  },
  {
    id: "col_cbs",
    name: "College of Basic Sciences",
    code: "CBS",
    tag: "CBS",
    dean: "Prof. O. Adebayo",
    departments: [
      {
        id: "dept_bch",
        name: "Biochemistry",
        code: "BCH",
        head: "Dr. S. K. Onasanya",
        programmes: [
          { id: "prog_bch", name: "B.Sc. Biochemistry", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_bch201", code: "BCH 201", title: "General Biochemistry I", level: "200", sem: "1st", lecturers: ["Dr. S. K. Onasanya"], status: "Active" },
        ],
      },
      {
        id: "dept_bot",
        name: "Botany",
        code: "BOT",
        head: "Dr. (Mrs.) C. N. Eze",
        programmes: [
          { id: "prog_bot", name: "B.Sc. Botany", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_bot201", code: "BOT 201", title: "Lower Plant Taxonomy", level: "200", sem: "1st", lecturers: ["Dr. C. N. Eze"], status: "Active" },
        ],
      },
      {
        id: "dept_chm",
        name: "Chemistry",
        code: "CHM",
        head: "Dr. P. A. Ogunsanya",
        programmes: [
          { id: "prog_chm", name: "B.Sc. Chemistry", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_chm101", code: "CHM 101", title: "General Physical Chemistry", level: "100", sem: "1st", lecturers: ["Dr. P. A. Ogunsanya"], status: "Active" },
          { id: "c_chm201", code: "CHM 201", title: "Organic Chemistry I", level: "200", sem: "1st", lecturers: ["Dr. P. A. Ogunsanya"], status: "Active" },
        ],
      },
      {
        id: "dept_csc",
        name: "Computer Science",
        code: "CSC",
        head: "Dr. Adeyemi",
        programmes: [
          { id: "prog_csc", name: "B.Sc. Computer Science", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
          { id: "prog_se", name: "B.Sc. Software Engineering", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_csc101", code: "CSC 101", title: "Introduction to Computing", level: "100", sem: "1st", lecturers: ["Dr. Adeyemi"], status: "Active" },
          { id: "c_csc201", code: "CSC 201", title: "Computer Programming I", level: "200", sem: "1st", lecturers: ["Dr. Adeyemi"], status: "Active" },
          { id: "c_csc301", code: "CSC 301", title: "Data Structures & Algorithms", level: "300", sem: "1st", lecturers: ["Dr. Bello"], status: "Active" },
          { id: "c_csc305", code: "CSC 305", title: "Algorithms & Complexity", level: "300", sem: "1st", lecturers: ["Dr. Bello"], status: "Active" },
        ],
      },
      {
        id: "dept_mth",
        name: "Mathematics",
        code: "MTH",
        head: "Dr. K. Salami",
        programmes: [
          { id: "prog_mth", name: "B.Sc. Mathematics", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_mth101", code: "MTH 101", title: "Elementary Mathematics I", level: "100", sem: "1st", lecturers: ["Dr. K. Salami"], status: "Active" },
          { id: "c_mth201", code: "MTH 201", title: "Mathematical Methods I", level: "200", sem: "1st", lecturers: ["Dr. K. Salami"], status: "Active" },
        ],
      },
      {
        id: "dept_mcb",
        name: "Microbiology",
        code: "MCB",
        head: "Dr. (Mrs.) O. T. Falade",
        programmes: [
          { id: "prog_mcb", name: "B.Sc. Microbiology", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_mcb201", code: "MCB 201", title: "General Microbiology I", level: "200", sem: "1st", lecturers: ["Dr. O. T. Falade"], status: "Active" },
        ],
      },
      {
        id: "dept_pwe",
        name: "Physics with Electronics",
        code: "PWE",
        head: "Dr. N. O. Adebisi",
        programmes: [
          { id: "prog_pwe", name: "B.Sc. Physics with Electronics", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_phy101", code: "PHY 101", title: "General Physics I", level: "100", sem: "1st", lecturers: ["Dr. N. O. Adebisi"], status: "Active" },
          { id: "c_pwe201", code: "PWE 201", title: "Circuit Theory & Electronics I", level: "200", sem: "1st", lecturers: ["Dr. N. O. Adebisi"], status: "Active" },
        ],
      },
      {
        id: "dept_sta",
        name: "Statistics",
        code: "STA",
        head: "Dr. A. A. Quadri",
        programmes: [
          { id: "prog_sta", name: "B.Sc. Statistics", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_sta201", code: "STA 201", title: "Probability Theory I", level: "200", sem: "1st", lecturers: ["Dr. A. A. Quadri"], status: "Active" },
        ],
      },
      {
        id: "dept_zoo",
        name: "Zoology",
        code: "ZOO",
        head: "Dr. E. O. Oshodi",
        programmes: [
          { id: "prog_zoo", name: "B.Sc. Zoology", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level"] },
        ],
        courses: [
          { id: "c_zoo201", code: "ZOO 201", title: "Invertebrate Zoology", level: "200", sem: "1st", lecturers: ["Dr. E. O. Oshodi"], status: "Active" },
        ],
      },
    ],
  },
  {
    id: "col_coet",
    name: "College of Engineering and Technology",
    code: "COET",
    tag: "COET",
    dean: "Prof. E. Johnson",
    departments: [
      {
        id: "dept_abe",
        name: "Agricultural and Biosystems Engineering",
        code: "ABE",
        head: "Engr. Dr. S. A. Olawale",
        programmes: [
          { id: "prog_abe", name: "B.Eng. Agricultural & Biosystems Engineering", degree: "B.Eng.", levels: ["100 level", "200 level", "300 level", "400 level", "500 level"] },
        ],
        courses: [
          { id: "c_abe201", code: "ABE 201", title: "Introduction to Biosystems Engineering", level: "200", sem: "1st", lecturers: ["Engr. Dr. S. A. Olawale"], status: "Active" },
        ],
      },
      {
        id: "dept_che",
        name: "Chemical Engineering",
        code: "CHE",
        head: "Engr. Dr. B. A. Adelekan",
        programmes: [
          { id: "prog_che", name: "B.Eng. Chemical Engineering", degree: "B.Eng.", levels: ["100 level", "200 level", "300 level", "400 level", "500 level"] },
        ],
        courses: [
          { id: "c_che201", code: "CHE 201", title: "Chemical Engineering Fundamentals", level: "200", sem: "1st", lecturers: ["Engr. Dr. B. A. Adelekan"], status: "Active" },
        ],
      },
      {
        id: "dept_cve",
        name: "Civil and Construction Engineering",
        code: "CVE",
        head: "Engr. Dr. O. F. Bamgbose",
        programmes: [
          { id: "prog_cve", name: "B.Eng. Civil & Construction Engineering", degree: "B.Eng.", levels: ["100 level", "200 level", "300 level", "400 level", "500 level"] },
        ],
        courses: [
          { id: "c_cve201", code: "CVE 201", title: "Strength of Materials I", level: "200", sem: "1st", lecturers: ["Engr. Dr. O. F. Bamgbose"], status: "Active" },
        ],
      },
      {
        id: "dept_cpe",
        name: "Computer Engineering",
        code: "CPE",
        head: "Engr. Dr. A. K. Alonge",
        programmes: [
          { id: "prog_cpe", name: "B.Eng. Computer Engineering", degree: "B.Eng.", levels: ["100 level", "200 level", "300 level", "400 level", "500 level"] },
        ],
        courses: [
          { id: "c_cpe201", code: "CPE 201", title: "Digital Logic Design", level: "200", sem: "1st", lecturers: ["Engr. Dr. A. K. Alonge"], status: "Active" },
        ],
      },
      {
        id: "dept_eee",
        name: "Electrical and Electronics Engineering",
        code: "EEE",
        head: "Engr. Prof. M. O. Lawal",
        programmes: [
          { id: "prog_eee", name: "B.Eng. Electrical & Electronics Engineering", degree: "B.Eng.", levels: ["100 level", "200 level", "300 level", "400 level", "500 level"] },
        ],
        courses: [
          { id: "c_eee201", code: "EEE 201", title: "Electric Circuit Theory", level: "200", sem: "1st", lecturers: ["Engr. Prof. M. O. Lawal"], status: "Active" },
        ],
      },
      {
        id: "dept_fst",
        name: "Food Science and Technology",
        code: "FST",
        head: "Dr. (Mrs.) T. I. Oyewole",
        programmes: [
          { id: "prog_fst", name: "B.Sc. Food Science and Technology", degree: "B.Sc.", levels: ["100 level", "200 level", "300 level", "400 level", "500 level"] },
        ],
        courses: [
          { id: "c_fst201", code: "FST 201", title: "Introduction to Food Technology", level: "200", sem: "1st", lecturers: ["Dr. T. I. Oyewole"], status: "Active" },
        ],
      },
      {
        id: "dept_mee",
        name: "Mechanical Engineering",
        code: "MEE",
        head: "Engr. F. Alabi",
        programmes: [
          { id: "prog_mee", name: "B.Eng. Mechanical Engineering", degree: "B.Eng.", levels: ["100 level", "200 level", "300 level", "400 level", "500 level"] },
        ],
        courses: [
          { id: "c_mee201", code: "MEE 201", title: "Engineering Mechanics I", level: "200", sem: "1st", lecturers: ["Engr. F. Alabi"], status: "Active" },
        ],
      },
      {
        id: "dept_mte",
        name: "Mechatronics Engineering",
        code: "MTE",
        head: "Engr. Dr. K. O. Gbadamosi",
        programmes: [
          { id: "prog_mte", name: "B.Eng. Mechatronics Engineering", degree: "B.Eng.", levels: ["100 level", "200 level", "300 level", "400 level", "500 level"] },
        ],
        courses: [
          { id: "c_mte201", code: "MTE 201", title: "Introduction to Mechatronics", level: "200", sem: "1st", lecturers: ["Engr. Dr. K. O. Gbadamosi"], status: "Active" },
        ],
      },
    ],
  },
];
