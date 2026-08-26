#!/usr/bin/env python3
"""Keep only Conduit application sources in a Cobertura document."""

from __future__ import annotations

import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def is_conduit_app_file(filename: str) -> bool:
    normalized = filename.replace("\\", "/")
    if "/obj/" in normalized:
        return False
    return "/src/Conduit/" in normalized or normalized.startswith("src/Conduit/")


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: cobertura-filter.py <coverage.cobertura.xml>", file=sys.stderr)
        return 2

    path = Path(sys.argv[1])
    tree = ET.parse(path)
    root = tree.getroot()

    lines_valid = 0
    lines_covered = 0
    branches_valid = 0
    branches_covered = 0

    packages = root.find("packages")
    if packages is None:
        print(f"{path} has no packages", file=sys.stderr)
        return 1

    for package in list(packages):
        if package.attrib.get("name") != "Conduit":
            packages.remove(package)
            continue

        classes_el = package.find("classes")
        if classes_el is None:
            continue
        for cls in list(classes_el):
            if not is_conduit_app_file(cls.attrib.get("filename", "")):
                classes_el.remove(cls)
                continue
            for line in cls.findall("./lines/line"):
                lines_valid += 1
                if int(line.attrib.get("hits", "0")) > 0:
                    lines_covered += 1
                conditions = line.findall("./conditions/condition")
                if not conditions:
                    continue
                branches_valid += len(conditions)
                for condition in conditions:
                    if condition.attrib.get("coverage") == "100%":
                        branches_covered += 1

    if lines_valid <= 0:
        print(f"{path} has no Conduit application lines after filtering", file=sys.stderr)
        return 1

    line_rate = lines_covered / lines_valid
    branch_rate = (branches_covered / branches_valid) if branches_valid else 0.0
    root.attrib["lines-valid"] = str(lines_valid)
    root.attrib["lines-covered"] = str(lines_covered)
    root.attrib["line-rate"] = str(line_rate)
    root.attrib["branches-valid"] = str(branches_valid)
    root.attrib["branches-covered"] = str(branches_covered)
    root.attrib["branch-rate"] = str(branch_rate)

    conduit_pkg = packages.find("package[@name='Conduit']")
    if conduit_pkg is not None:
        conduit_pkg.attrib["line-rate"] = str(line_rate)
        conduit_pkg.attrib["branch-rate"] = str(branch_rate)

    tree.write(path, encoding="utf-8", xml_declaration=True)
    print(f"{path}: Conduit {lines_covered}/{lines_valid} lines ({line_rate:.1%})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
