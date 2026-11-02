import csv
import sys

# Script to convert the Kerala College list into a formatted Excel (.xlsx) file
# with conditional formatting for red highlighting of Unverified rows.

try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter
    has_openpyxl = True
except ImportError:
    has_openpyxl = False

def create_excel():
    csv_file = "Kerala_Colleges_Rows_646_to_1289.csv"
    xlsx_file = "Kerala_Colleges_Rows_646_to_1289.xlsx"

    if not has_openpyxl:
        print("openpyxl is not installed. Please install it using: pip install openpyxl")
        return

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Kerala Colleges 646-1289"

    # Styling definitions
    header_fill = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    red_fill = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")
    red_font = Font(name="Calibri", size=10, color="9C0006")
    regular_font = Font(name="Calibri", size=10, color="000000")
    thin_border = Border(
        left=Side(style='thin', color='D9D9D9'),
        right=Side(style='thin', color='D9D9D9'),
        top=Side(style='thin', color='D9D9D9'),
        bottom=Side(style='thin', color='D9D9D9')
    )

    with open(csv_file, mode='r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row_idx, row in enumerate(reader, start=1):
            ws.append(row)
            is_header = (row_idx == 1)
            row_has_unverified = False

            if not is_header:
                for cell_value in row:
                    if "unverified" in str(cell_value).lower() or cell_value.strip() == "":
                        row_has_unverified = True
                        break

            for col_idx in range(1, len(row) + 1):
                cell = ws.cell(row=row_idx, column=col_idx)
                cell.border = thin_border

                if is_header:
                    cell.fill = header_fill
                    cell.font = header_font
                    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
                else:
                    cell.alignment = Alignment(vertical="top", wrap_text=True)
                    if row_has_unverified:
                        cell.fill = red_fill
                        cell.font = red_font
                    else:
                        cell.font = regular_font

    # Adjust column widths
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val = str(cell.value or '')
            if len(val) > max_len:
                max_len = len(val)
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 45)

    ws.row_dimensions[1].height = 28
    wb.save(xlsx_file)
    print(f"Successfully generated {xlsx_file}")

if __name__ == "__main__":
    create_excel()
