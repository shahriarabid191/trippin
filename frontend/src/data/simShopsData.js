// Bangladesh SIM/eSIM Shops Data
// Organized by District > Area (alphabetical) > Shops

export const bangladeshDistricts = [
  "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola",
  "Bogura", "Brahmanbaria", "Chandpur", "Chattogram", "Chuadanga",
  "Cox's Bazar", "Cumilla", "Dhaka", "Dinajpur", "Faridpur",
  "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj",
  "Jamalpur", "Jessore (Jashore)", "Jhalokati", "Jhenaidah", "Joypurhat",
  "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia",
  "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj",
  "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon",
  "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona",
  "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali",
  "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur",
  "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj",
  "Sylhet", "Tangail", "Thakurgaon"
];

// Operators info
export const operators = {
  grameenphone: {
    name: "Grameenphone (GP)",
    color: "#00a651",
    logo: "📶"
  },
  robi: {
    name: "Robi",
    color: "#e2001a",
    logo: "📡"
  },
  banglalink: {
    name: "Banglalink",
    color: "#f7941d",
    logo: "📱"
  },
  teletalk: {
    name: "Teletalk",
    color: "#1a5276",
    logo: "🌐"
  },
  airtel: {
    name: "Airtel (Robi)",
    color: "#ef3e42",
    logo: "📶"
  }
};

export const shopsByDistrict = {
  "Dhaka": {
    "Banani": [
      {
        id: "dhk-ban-001",
        name: "GP Express Banani",
        operator: ["grameenphone"],
        phone: "+880 1711-000001",
        altPhone: "+880 1711-000002",
        address: "House 42, Road 11, Block C, Banani, Dhaka-1213",
        landmark: "Near Banani Club, opposite Dhaka Bank",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM, Fri: 11:00 AM – 8:00 PM",
        services: ["New SIM", "eSIM Activation", "Biometric Registration", "SIM Replacement", "Number Transfer", "Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Banani+GP+Express+Dhaka",
        email: "banani.express@gp.com.bd",
        established: "2015"
      },
      {
        id: "dhk-ban-002",
        name: "Robi Care Point Banani",
        operator: ["robi", "airtel"],
        phone: "+880 1819-000101",
        altPhone: null,
        address: "Plot 25, Road 17, Banani, Dhaka-1213",
        landmark: "Beside Banani Super Market, 1st floor Karim Tower",
        hours: "Sat–Thu: 10:00 AM – 8:30 PM, Fri: 12:00 PM – 7:00 PM",
        services: ["New SIM", "eSIM", "Number Portability", "SIM Replacement", "Corporate Plans", "Recharge"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Robi+Care+Banani+Dhaka",
        email: "banani@robi.com.bd",
        established: "2017"
      }
    ],
    "Dhanmondi": [
      {
        id: "dhk-dha-001",
        name: "GP World Dhanmondi",
        operator: ["grameenphone"],
        phone: "+880 1711-100100",
        altPhone: "+880 1711-100101",
        address: "House 2, Road 27 (Old), Dhanmondi, Dhaka-1209",
        landmark: "Ground Floor, Dhanmondi Lake View Tower, near Lake",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM, Fri: 11:00 AM – 8:00 PM",
        services: ["New SIM", "eSIM Activation", "Biometric Registration", "International Roaming", "Postpaid Plans", "SIM Replacement"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+World+Dhanmondi+Dhaka",
        email: "dhanmondi@gp.com.bd",
        established: "2012"
      },
      {
        id: "dhk-dha-002",
        name: "Banglalink Dhanmondi Center",
        operator: ["banglalink"],
        phone: "+880 1911-200200",
        altPhone: null,
        address: "Plot 7A, Road 2, Dhanmondi R/A, Dhaka-1205",
        landmark: "Opposite to Dhanmondi 2 Police Box",
        hours: "Sat–Thu: 9:30 AM – 8:30 PM, Fri: 10:30 AM – 7:30 PM",
        services: ["New SIM", "eSIM", "SIM Replacement", "Recharge", "Data Plans", "Bundled Offers"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Banglalink+Dhanmondi+Dhaka",
        email: "dhanmondi@banglalink.net",
        established: "2014"
      },
      {
        id: "dhk-dha-003",
        name: "Teletalk Service Center Dhanmondi",
        operator: ["teletalk"],
        phone: "+880 1500-888001",
        altPhone: "+880 1500-888002",
        address: "Road 5, House 12, Dhanmondi, Dhaka-1207",
        landmark: "Adjacent to Dhanmondi Government School",
        hours: "Sun–Thu: 9:00 AM – 5:00 PM",
        services: ["New SIM", "Biometric Registration", "SIM Replacement", "Bill Payment", "Government Service Packages"],
        esimSupport: false,
        mapLink: "https://maps.google.com/?q=Teletalk+Dhanmondi+Dhaka",
        email: null,
        established: "2010"
      }
    ],
    "Gulshan": [
      {
        id: "dhk-gul-001",
        name: "GP Flagship Store Gulshan",
        operator: ["grameenphone"],
        phone: "+880 1711-200001",
        altPhone: "+880 1711-200002",
        address: "Plot CWN-A-6, Road 49, Gulshan 2, Dhaka-1212",
        landmark: "Gulshan Circle 2, Concord Tower Ground Floor",
        hours: "Sat–Thu: 9:00 AM – 10:00 PM, Fri: 12:00 PM – 9:00 PM",
        services: ["New SIM", "eSIM", "Biometric", "iPhone eSIM Setup", "International Roaming", "Premium Postpaid", "Corporate Accounts"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+Flagship+Gulshan+Dhaka",
        email: "gulshan@gp.com.bd",
        established: "2011"
      },
      {
        id: "dhk-gul-002",
        name: "Robi Axiata Premium Center Gulshan",
        operator: ["robi", "airtel"],
        phone: "+880 1819-300100",
        altPhone: "+880 1819-300101",
        address: "4th Floor, Gulshan Pink City, Plot 15, Road 103, Gulshan 2, Dhaka-1212",
        landmark: "Pink City Shopping Complex, Gulshan 2 Circle",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM, Fri: 11:00 AM – 8:00 PM",
        services: ["New SIM", "eSIM", "Number Portability", "Corporate Plans", "eSIM for Travelers", "Premium Support"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Robi+Premium+Gulshan+Dhaka",
        email: "gulshan@robi.com.bd",
        established: "2016"
      }
    ],
    "Mirpur": [
      {
        id: "dhk-mir-001",
        name: "GP Service Center Mirpur 10",
        operator: ["grameenphone"],
        phone: "+880 1711-400100",
        altPhone: null,
        address: "Section 10, Road 5, Block B, Mirpur, Dhaka-1216",
        landmark: "Near Mirpur 10 Metro Station, opposite City Bank",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM, Fri: 12:00 PM – 8:00 PM",
        services: ["New SIM", "eSIM", "Biometric Registration", "SIM Replacement", "Data Plans", "Recharge"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+Mirpur+10+Dhaka",
        email: "mirpur10@gp.com.bd",
        established: "2013"
      },
      {
        id: "dhk-mir-002",
        name: "Banglalink Mirpur",
        operator: ["banglalink"],
        phone: "+880 1911-400200",
        altPhone: null,
        address: "Section 6, Block C, Road 2, Mirpur, Dhaka-1216",
        landmark: "Opposite Mirpur 6 Bus Stand",
        hours: "Sat–Thu: 10:00 AM – 8:00 PM",
        services: ["New SIM", "SIM Replacement", "Recharge", "Data Plans"],
        esimSupport: false,
        mapLink: "https://maps.google.com/?q=Banglalink+Mirpur+Dhaka",
        email: null,
        established: "2015"
      }
    ],
    "Motijheel": [
      {
        id: "dhk-mot-001",
        name: "GP World Motijheel",
        operator: ["grameenphone"],
        phone: "+880 1711-500001",
        altPhone: "+880 1711-500002",
        address: "Dilkusha C/A, Motijheel, Dhaka-1000",
        landmark: "Ground Floor, Eastern Banking Building, near Shapla Chattar",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM, Fri: 11:00 AM – 8:00 PM",
        services: ["New SIM", "eSIM", "Corporate Plans", "Postpaid", "Biometric", "Bill Payment", "International Roaming"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+World+Motijheel+Dhaka",
        email: "motijheel@gp.com.bd",
        established: "2009"
      },
      {
        id: "dhk-mot-002",
        name: "Robi Business Hub Motijheel",
        operator: ["robi"],
        phone: "+880 1819-500100",
        altPhone: "+880 1819-500101",
        address: "Motijheel C/A, BDBL Bhaban, 2nd Floor, Dhaka-1000",
        landmark: "BDBL Building, near Bangladesh Bank Circle",
        hours: "Sat–Thu: 9:00 AM – 7:00 PM",
        services: ["Corporate SIM", "eSIM", "Bulk SIM", "Number Portability", "Business Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Robi+Motijheel+Dhaka",
        email: "business.motijheel@robi.com.bd",
        established: "2014"
      },
      {
        id: "dhk-mot-003",
        name: "Teletalk Headquarters",
        operator: ["teletalk"],
        phone: "+880 1500-888100",
        altPhone: "+880 2-9553551",
        address: "Teletalk HQ, Dilkusha C/A, Dhaka-1000",
        landmark: "Main Teletalk Office, Dilkusha Commercial Area",
        hours: "Sun–Thu: 9:00 AM – 5:30 PM",
        services: ["New SIM", "Biometric", "Government Plans", "Corporate", "SIM Replacement", "Complaint Resolution"],
        esimSupport: false,
        mapLink: "https://maps.google.com/?q=Teletalk+HQ+Motijheel+Dhaka",
        email: "info@teletalk.com.bd",
        established: "2005"
      }
    ],
    "Uttara": [
      {
        id: "dhk-utt-001",
        name: "GP Express Uttara",
        operator: ["grameenphone"],
        phone: "+880 1711-600100",
        altPhone: null,
        address: "House 20, Road 7, Sector 3, Uttara, Dhaka-1230",
        landmark: "Near Uttara Town Center, opposite Trust Bank",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM, Fri: 12:00 PM – 8:00 PM",
        services: ["New SIM", "eSIM", "Biometric", "SIM Replacement", "Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+Express+Uttara+Dhaka",
        email: "uttara@gp.com.bd",
        established: "2016"
      },
      {
        id: "dhk-utt-002",
        name: "Banglalink Uttara Branch",
        operator: ["banglalink"],
        phone: "+880 1911-600100",
        altPhone: null,
        address: "Sector 7, Road 3, Uttara, Dhaka-1230",
        landmark: "Beside Uttara Bank, Sector 7",
        hours: "Sat–Thu: 10:00 AM – 8:30 PM",
        services: ["New SIM", "eSIM", "SIM Replacement", "Recharge", "Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Banglalink+Uttara+Dhaka",
        email: null,
        established: "2017"
      }
    ],
    "Wari": [
      {
        id: "dhk-war-001",
        name: "GP Service Point Wari",
        operator: ["grameenphone"],
        phone: "+880 1711-700100",
        altPhone: null,
        address: "72, Tipu Sultan Road, Wari, Dhaka-1203",
        landmark: "Near Wari Mosque, beside Standard Chartered Bank ATM",
        hours: "Sat–Thu: 9:00 AM – 8:00 PM, Fri: 11:00 AM – 6:00 PM",
        services: ["New SIM", "Biometric", "SIM Replacement", "Recharge", "Data Plans"],
        esimSupport: false,
        mapLink: "https://maps.google.com/?q=GP+Wari+Dhaka",
        email: null,
        established: "2014"
      },
      {
        id: "dhk-war-002",
        name: "Mobile Zone Wari",
        operator: ["grameenphone", "robi", "banglalink", "teletalk"],
        phone: "+880 1618-700200",
        altPhone: "+880 1618-700201",
        address: "15, Johnson Road, Wari, Dhaka-1203",
        landmark: "Johnson Road Market, 1st shop from Gopibagh end",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM, Fri: 12:00 PM – 9:00 PM",
        services: ["All Operators SIM", "SIM Replacement", "Recharge", "Data Plans", "Handset Sales", "Accessories"],
        esimSupport: false,
        mapLink: "https://maps.google.com/?q=Mobile+Zone+Wari+Dhaka",
        email: null,
        established: "2011"
      }
    ]
  },

  "Chattogram": {
    "Agrabad": [
      {
        id: "ctg-agr-001",
        name: "GP World Agrabad",
        operator: ["grameenphone"],
        phone: "+880 1711-800100",
        altPhone: "+880 1711-800101",
        address: "Park View Tower, 58 Agrabad C/A, Chattogram-4100",
        landmark: "Agrabad Commercial Area, near EPZ crossing",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM, Fri: 11:00 AM – 8:00 PM",
        services: ["New SIM", "eSIM", "Biometric", "Corporate Plans", "International Roaming", "Postpaid"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+World+Agrabad+Chattogram",
        email: "agrabad@gp.com.bd",
        established: "2010"
      },
      {
        id: "ctg-agr-002",
        name: "Robi Care Agrabad",
        operator: ["robi", "airtel"],
        phone: "+880 1819-800100",
        altPhone: null,
        address: "CDA Avenue, Agrabad, Chattogram-4100",
        landmark: "Near Agrabad Hotel, CDA Avenue side",
        hours: "Sat–Thu: 10:00 AM – 8:00 PM",
        services: ["New SIM", "eSIM", "Number Portability", "Corporate SIM", "Data Packages"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Robi+Care+Agrabad+Chattogram",
        email: "agrabad@robi.com.bd",
        established: "2015"
      }
    ],
    "GEC Circle": [
      {
        id: "ctg-gec-001",
        name: "Banglalink GEC Circle",
        operator: ["banglalink"],
        phone: "+880 1911-800200",
        altPhone: null,
        address: "GEC Circle, 2219 Sheikh Mujib Road, Chattogram-4000",
        landmark: "GEC More, ground floor Amin Court Building",
        hours: "Sat–Thu: 9:30 AM – 8:30 PM",
        services: ["New SIM", "eSIM", "SIM Replacement", "Data Plans", "Recharge"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Banglalink+GEC+Chattogram",
        email: null,
        established: "2016"
      }
    ],
    "Nasirabad": [
      {
        id: "ctg-nas-001",
        name: "GP Express Nasirabad",
        operator: ["grameenphone"],
        phone: "+880 1711-850100",
        altPhone: null,
        address: "2/B, Nasirabad Housing Society, Chattogram-4210",
        landmark: "Adjacent to Nasirabad Government Boys School",
        hours: "Sat–Thu: 9:00 AM – 8:30 PM, Fri: 11:00 AM – 7:00 PM",
        services: ["New SIM", "eSIM", "Biometric", "SIM Replacement", "Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+Nasirabad+Chattogram",
        email: "nasirabad@gp.com.bd",
        established: "2018"
      }
    ]
  },

  "Sylhet": {
    "Ambarkhana": [
      {
        id: "syl-amb-001",
        name: "GP World Ambarkhana",
        operator: ["grameenphone"],
        phone: "+880 1711-900001",
        altPhone: null,
        address: "Ambarkhana Point, Sylhet-3100",
        landmark: "Ambarkhana Intersection, near Islami Bank Building",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM, Fri: 12:00 PM – 8:00 PM",
        services: ["New SIM", "eSIM", "Biometric", "International Roaming", "SIM Replacement"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+Ambarkhana+Sylhet",
        email: "ambarkhana@gp.com.bd",
        established: "2013"
      }
    ],
    "Zindabazar": [
      {
        id: "syl-zin-001",
        name: "GP Express Zindabazar",
        operator: ["grameenphone"],
        phone: "+880 1711-910001",
        altPhone: "+880 1711-910002",
        address: "Zindabazar Main Road, Sylhet-3100",
        landmark: "Near Zindabazar Bridge, opposite Surma Tower",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM",
        services: ["New SIM", "eSIM", "Biometric", "SIM Replacement", "Recharge"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+Zindabazar+Sylhet",
        email: null,
        established: "2012"
      },
      {
        id: "syl-zin-002",
        name: "Robi Care Zindabazar",
        operator: ["robi"],
        phone: "+880 1819-910001",
        altPhone: null,
        address: "Zindabazar Point, Sylhet-3100",
        landmark: "Ground Floor, Muktadir Tower, Zindabazar",
        hours: "Sat–Thu: 10:00 AM – 8:00 PM, Fri: 12:00 PM – 7:00 PM",
        services: ["New SIM", "eSIM", "Number Portability", "Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Robi+Zindabazar+Sylhet",
        email: null,
        established: "2016"
      }
    ]
  },

  "Rajshahi": {
    "Natore Road": [
      {
        id: "raj-nat-001",
        name: "GP Service Center Natore Road",
        operator: ["grameenphone"],
        phone: "+880 1711-950001",
        altPhone: null,
        address: "262 Natore Road, Rajshahi-6000",
        landmark: "Near Rajshahi College Gate, opposite Rajshahi Medical",
        hours: "Sat–Thu: 9:00 AM – 8:00 PM",
        services: ["New SIM", "eSIM", "Biometric", "SIM Replacement", "Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+Natore+Road+Rajshahi",
        email: "rajshahi@gp.com.bd",
        established: "2014"
      }
    ],
    "Saheb Bazar": [
      {
        id: "raj-sah-001",
        name: "Banglalink Saheb Bazar",
        operator: ["banglalink"],
        phone: "+880 1911-950001",
        altPhone: null,
        address: "Saheb Bazar Main Road, Rajshahi-6000",
        landmark: "Beside Rajshahi City Corporation Market",
        hours: "Sat–Thu: 9:30 AM – 8:30 PM",
        services: ["New SIM", "SIM Replacement", "Recharge", "Data Plans"],
        esimSupport: false,
        mapLink: "https://maps.google.com/?q=Banglalink+Saheb+Bazar+Rajshahi",
        email: null,
        established: "2015"
      }
    ]
  },

  "Khulna": {
    "Boyra": [
      {
        id: "khu-boy-001",
        name: "GP World Boyra",
        operator: ["grameenphone"],
        phone: "+880 1711-980001",
        altPhone: null,
        address: "Boyra More, Khulna-9100",
        landmark: "Boyra Bus Terminal Area, near Khulna Polytechnic",
        hours: "Sat–Thu: 9:00 AM – 8:30 PM, Fri: 11:00 AM – 7:00 PM",
        services: ["New SIM", "eSIM", "Biometric", "SIM Replacement", "Postpaid"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+Boyra+Khulna",
        email: "khulna@gp.com.bd",
        established: "2015"
      }
    ],
    "KDA Avenue": [
      {
        id: "khu-kda-001",
        name: "GP Express KDA Avenue",
        operator: ["grameenphone"],
        phone: "+880 1711-985001",
        altPhone: "+880 1711-985002",
        address: "KDA Avenue, Khulna-9100",
        landmark: "Opposite Khulna Development Authority HQ",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM",
        services: ["New SIM", "eSIM", "Biometric", "SIM Replacement", "Data Plans", "International Roaming"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+KDA+Avenue+Khulna",
        email: null,
        established: "2013"
      },
      {
        id: "khu-kda-002",
        name: "Robi Care KDA Avenue",
        operator: ["robi"],
        phone: "+880 1819-985001",
        altPhone: null,
        address: "117 KDA Avenue, Khulna-9100",
        landmark: "KDA Avenue, near Dutch-Bangla Bank",
        hours: "Sat–Thu: 10:00 AM – 8:00 PM",
        services: ["New SIM", "eSIM", "Number Portability", "Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Robi+KDA+Khulna",
        email: null,
        established: "2017"
      }
    ]
  },

  "Cox's Bazar": {
    "Bazarghata": [
      {
        id: "cxb-baz-001",
        name: "GP Express Bazarghata",
        operator: ["grameenphone"],
        phone: "+880 1711-990001",
        altPhone: null,
        address: "Bazarghata, Cox's Bazar-4700",
        landmark: "Bazarghata Intersection, near Cox's Bazar Sadar Hospital",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM",
        services: ["New SIM", "eSIM", "Tourist SIM", "Biometric", "SIM Replacement", "Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+Bazarghata+Cox's+Bazar",
        email: "coxsbazar@gp.com.bd",
        established: "2012"
      },
      {
        id: "cxb-baz-002",
        name: "Robi Tourist SIM Center",
        operator: ["robi", "airtel"],
        phone: "+880 1819-990100",
        altPhone: null,
        address: "Main Bazar Road, Bazarghata, Cox's Bazar-4700",
        landmark: "Tourist Zone Entry, near Parjatan Motel",
        hours: "Daily: 8:00 AM – 10:00 PM",
        services: ["Tourist SIM", "New SIM", "eSIM", "International Roaming", "Short-term Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Robi+Tourist+SIM+Cox's+Bazar",
        email: null,
        established: "2018"
      }
    ],
    "Hotel Motel Zone": [
      {
        id: "cxb-hmz-001",
        name: "Banglalink Tourist Hub",
        operator: ["banglalink"],
        phone: "+880 1911-990001",
        altPhone: "+880 1911-990002",
        address: "Hotel Motel Zone, Cox's Bazar-4701",
        landmark: "Marine Drive, Hotel Motel Zone entrance",
        hours: "Daily: 8:00 AM – 10:00 PM",
        services: ["Tourist SIM", "New SIM", "eSIM", "Short-term Plans", "Data Packages", "Recharge"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Banglalink+Hotel+Motel+Zone+Cox's+Bazar",
        email: null,
        established: "2019"
      }
    ]
  },

  "Gazipur": {
    "Board Bazar": [
      {
        id: "gaz-bbd-001",
        name: "GP Service Center Board Bazar",
        operator: ["grameenphone"],
        phone: "+880 1711-700200",
        altPhone: null,
        address: "Board Bazar, Joydebpur, Gazipur-1700",
        landmark: "Board Bazar Mor, near Gazipur City Corporation",
        hours: "Sat–Thu: 9:00 AM – 8:30 PM",
        services: ["New SIM", "eSIM", "Biometric", "SIM Replacement", "Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+Board+Bazar+Gazipur",
        email: null,
        established: "2017"
      }
    ],
    "Tongi": [
      {
        id: "gaz-ton-001",
        name: "Robi Care Tongi",
        operator: ["robi"],
        phone: "+880 1819-700200",
        altPhone: null,
        address: "Tongi Station Road, Gazipur-1711",
        landmark: "Opposite Tongi Railway Station",
        hours: "Sat–Thu: 9:30 AM – 8:30 PM",
        services: ["New SIM", "eSIM", "Number Portability", "SIM Replacement"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Robi+Tongi+Gazipur",
        email: null,
        established: "2018"
      }
    ]
  },

  "Narayanganj": {
    "Chashara": [
      {
        id: "nar-cha-001",
        name: "GP World Chashara",
        operator: ["grameenphone"],
        phone: "+880 1711-750001",
        altPhone: null,
        address: "Chashara Circle, Narayanganj-1400",
        landmark: "Chashara Intersection, beside Prime Bank",
        hours: "Sat–Thu: 9:00 AM – 9:00 PM",
        services: ["New SIM", "eSIM", "Biometric", "SIM Replacement", "Postpaid", "Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+Chashara+Narayanganj",
        email: "narayanganj@gp.com.bd",
        established: "2014"
      }
    ],
    "Deobhog": [
      {
        id: "nar-deo-001",
        name: "Banglalink Deobhog",
        operator: ["banglalink"],
        phone: "+880 1911-750001",
        altPhone: null,
        address: "Deobhog Road, Narayanganj-1400",
        landmark: "Near Deobhog Bazar",
        hours: "Sat–Thu: 10:00 AM – 8:00 PM",
        services: ["New SIM", "SIM Replacement", "Recharge", "Data Plans"],
        esimSupport: false,
        mapLink: "https://maps.google.com/?q=Banglalink+Deobhog+Narayanganj",
        email: null,
        established: "2016"
      }
    ]
  },

  "Mymensingh": {
    "Ganginarpar": [
      {
        id: "mym-gan-001",
        name: "GP Express Ganginarpar",
        operator: ["grameenphone"],
        phone: "+880 1711-820001",
        altPhone: null,
        address: "Ganginarpar, Mymensingh-2200",
        landmark: "Near Mymensingh Agricultural University Gate",
        hours: "Sat–Thu: 9:00 AM – 8:30 PM",
        services: ["New SIM", "eSIM", "Biometric", "SIM Replacement", "Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=GP+Ganginarpar+Mymensingh",
        email: null,
        established: "2016"
      }
    ],
    "Notun Bazar": [
      {
        id: "mym-not-001",
        name: "Robi Care Notun Bazar",
        operator: ["robi"],
        phone: "+880 1819-820001",
        altPhone: null,
        address: "Notun Bazar, Mymensingh-2200",
        landmark: "Notun Bazar Main Road, beside Dutch-Bangla Bank ATM",
        hours: "Sat–Thu: 10:00 AM – 8:00 PM",
        services: ["New SIM", "eSIM", "Number Portability", "Data Plans"],
        esimSupport: true,
        mapLink: "https://maps.google.com/?q=Robi+Notun+Bazar+Mymensingh",
        email: null,
        established: "2017"
      }
    ]
  }
};

// Helper to get areas by district (sorted alphabetically)
export function getAreasByDistrict(district) {
  const districtData = shopsByDistrict[district];
  if (!districtData) return [];
  return Object.keys(districtData).sort((a, b) => a.localeCompare(b));
}

// Helper to get shops by district and area
export function getShopsByArea(district, area) {
  return shopsByDistrict[district]?.[area] || [];
}

// Helper to get operator details
export function getOperatorDetails(operatorKey) {
  return operators[operatorKey] || { name: operatorKey, color: "#666", logo: "📱" };
}
