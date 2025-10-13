premier_reference = {
    (1000, 4999):  {"aim": 31, "positioning": 46, "utility": 47},
    (5000, 9999):  {"aim": 48, "positioning": 50, "utility": 49},
    (10000, 14999): {"aim": 58, "positioning": 51, "utility": 51},
    (15000, 19999): {"aim": 66, "positioning": 53, "utility": 52},
    (20000, 24999): {"aim": 74, "positioning": 55, "utility": 54},
    (25000, 99999): {"aim": 82, "positioning": 57, "utility": 56},
}

faceit_reference = {
    (100, 500):   {"aim": 33, "positioning": 49, "utility": 28},
    (501, 750):   {"aim": 46, "positioning": 53, "utility": 31},
    (751, 900):   {"aim": 53, "positioning": 54, "utility": 31},
    (901, 1050):  {"aim": 59, "positioning": 55, "utility": 32},
    (1051, 1200): {"aim": 65, "positioning": 58, "utility": 33},
    (1201, 1350): {"aim": 68, "positioning": 60, "utility": 34},
    (1351, 1530): {"aim": 71, "positioning": 61, "utility": 35},
    (1531, 1750): {"aim": 74, "positioning": 62, "utility": 36},
    (1751, 2000): {"aim": 75, "positioning": 62, "utility": 37},
    (2001, 99999): {"aim": 81, "positioning": 64, "utility": 39},
}

leetify_tiers = {
    "poor": (-999, -5.12),
    "subpar": (-5.12, -2.09),
    "average": (-2.09, 2.09),
    "good": (2.09, 5.12),
    "great": (5.12, 999),
}