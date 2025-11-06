import { Component, OnInit } from '@angular/core';
import { DataService, routes } from 'src/app/core/core.index';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-purchases-details',
  templateUrl: './purchases-details.component.html',
  styleUrls: ['./purchases-details.component.scss']
})
export class PurchasesDetailsComponent implements OnInit {
  public routes = routes;
  reservationToView: any = {};
  ledgerToView: any = [];
  menuItems: any = [];
  companySettings: any = {};
  user: any = {};

  constructor(private route: ActivatedRoute, private data: DataService) { }

  ngOnInit(): void {
    this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
    try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch { }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    this.companySettings = JSON.parse(localStorage.getItem('companySettings') || '{}');
    this.route.queryParams.subscribe(params => {
      let id = params['id'];
      this.data.getReservationById(id).subscribe((res: any) => {
        res.date = new Date(res.date).toLocaleString('en-US', options);
        res.dashboardDate = new Date(res.dashboardDate).toLocaleString('en-US', options);
        this.reservationToView = res;

        this.data.getReservationLedgerById(id).subscribe((res: any) => {
          res.data.forEach((item: any) => {
            item.date = new Date(item.date).toLocaleString('en-US', options);
          });
          this.ledgerToView = res.data;
        });

        this.data.getMenuItems().subscribe((res: any) => {
          // Parse menu_items_ids if it's a string, otherwise use as array
          let menuItemIds: number[] = [];
          if (typeof this.reservationToView.menu_items_ids === 'string') {
            try {
              menuItemIds = JSON.parse(this.reservationToView.menu_items_ids);
            } catch (e) {
              console.error('Error parsing menu_items_ids:', e);
              menuItemIds = [];
            }
          } else if (Array.isArray(this.reservationToView.menu_items_ids)) {
            menuItemIds = this.reservationToView.menu_items_ids;
          }

          this.menuItems = res.filter((item: any) => {
            return menuItemIds.includes(item.menu_item_id);
          });
        });
      });
    });
  }

  editedLedger: any = null;
  editedAmount: number | null = null;

  setLedgerToEdit(ledger: any) {
    this.editedLedger = ledger;
    this.editedAmount = ledger.amount;
  }

  cancelEdit() {
    this.editedLedger = null;
    this.editedAmount = null;
  }

  ledgerToEdit: any = {}
  updateLedger() {
    this.data.getLedgerByID(this.editedLedger.ledgerId).subscribe((res: any) => {
      this.ledgerToEdit = res;
      this.ledgerToEdit.amountCredit = this.editedLedger.amount;

      this.data.updateLedgerById(this.ledgerToEdit).subscribe((res) => {
        this.updateReservationLedger(res);
      });
    });
  }

  updateReservationLedger(res: any) {
    this.data.updateReservationLedgerById(this.editedLedger).subscribe((res) => {
      let requestBody = {
        id: this.editedLedger.booking_id,
        paymentToAdd: this.editedLedger.amount - this.originalAmount,
      }

      this.data.addReservationPayment(requestBody).subscribe((res: any) => {
        let requestBody = {
          id: this.editedLedger.trans_id,
          amount: this.editedLedger.amount,
        }
        this.data.updateTransactionAmount(requestBody).subscribe((res) => {
          window.location.reload();
        });
      });
    });
  }

  originalAmount: number = 0;

  saveEdit() {
    if (this.editedLedger) {
      this.originalAmount = this.editedLedger.amount;
      this.editedLedger.amount = this.editedAmount;
      this.updateLedger();
    }
  }

  // Chunk menu items into groups of 6
  getMenuItemsChunked(): any[][] {
    const chunkSize = 4;
    const chunks: any[][] = [];
    for (let i = 0; i < this.menuItems.length; i += chunkSize) {
      chunks.push(this.menuItems.slice(i, i + chunkSize));
    }
    return chunks;
  }

  printInvoice() {
    const originalContent = document.querySelector('.card');
    if (!originalContent) return;

    const clone = originalContent.cloneNode(true) as HTMLElement;

    // Remove navigation buttons from the cloned content
    const navigationContainer = clone.querySelector('.d-flex.justify-content-between.align-items-center.mb-3');
    if (navigationContainer) {
      navigationContainer.remove();
    }

    // Also remove any elements with no-print class
    const noPrintElements = clone.querySelectorAll('.no-print');
    noPrintElements.forEach(element => element.remove());

    // Remove any remaining buttons
    const buttons = clone.querySelectorAll('button[routerLink], a[href*="javascript:void(0)"]');
    buttons.forEach(button => button.remove());

    // Fix logo loading issue by ensuring the image is properly set
    const logoImg = clone.querySelector('img[alt="logo"]') as HTMLImageElement;
    if (logoImg) {
      const isBase64 = this.companySettings.logo?.startsWith('data:image/');
      const imageSrc = isBase64
        ? this.companySettings.logo
        : `${window.location.origin}/assets/img/newLogo2.png`;

      // Create a new image element to ensure proper loading
      const newImg = new Image();
      newImg.onload = () => {
        logoImg.src = imageSrc;
        logoImg.removeAttribute('[src]');
        // Trigger print after image is loaded
        this.triggerPrint(clone);
      };
      newImg.onerror = () => {
        // Fallback to default logo if custom logo fails to load
        logoImg.src = `${window.location.origin}/assets/img/newLogo2.png`;
        logoImg.removeAttribute('[src]');
        this.triggerPrint(clone);
      };
      newImg.src = imageSrc;
    } else {
      // If no logo found, proceed with print
      this.triggerPrint(clone);
    }
  }

  private triggerPrint(clone: HTMLElement) {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
          <style>
            body { 
              padding: 20px; 
              font-family: Arial, sans-serif; 
              margin: 0;
            }
            
            .invoice-logo img { 
              max-width: 180px; 
              height: auto;
            }
            
            .table th, .table td { 
              padding: 8px; 
            }
            
            /* Print preview header layout - logo left, company details center */
            .content-invoice-header {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              margin-bottom: 30px !important;
            }
            
            .invoice-item-one {
              flex: 0 0 auto !important;
            }
            
            .text-center {
              flex: 1 !important;
              text-align: center !important;
              margin: 0 20px !important;
            }
            
            /* Company name styling for print preview */
            .text-center h5 {
              font-weight: bold !important;
              font-size: 1.8rem !important;
              margin-bottom: 15px !important;
              color: #333 !important;
            }
            
            /* Address and contact spacing */
            .text-center p {
              margin-top: 10px !important;
              line-height: 1.6 !important;
              font-size: 1.1rem !important;
            }
            
            /* Make "Address:" bold and italic */
            .text-center p .text-muted {
              font-weight: bold !important;
              font-style: italic !important;
              font-size: 1.1rem !important;
            }
            
            /* Ensure no navigation elements are visible */
            .d-flex.justify-content-between.align-items-center.mb-3,
            .no-print,
            button[routerLink],
            a[href*="javascript:void(0)"] {
              display: none !important;
              visibility: hidden !important;
            }
            
            /* Keep card styling minimal */
            .card {
              box-shadow: none !important;
              border: 1px solid #ddd !important;
            }
            
            /* Menu items border styling */
            .menu-items-row td:nth-child(-n+4) {
              border: 3px solid #dee2e6 !important;
            }
            
            .menu-items-header td:nth-child(-n+4) {
              border: 1px solid #dee2e6 !important;
              font-weight: 600;
              background-color: #f8f9fa;
            }
          </style>
        </head>
        <body></body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.document.body.appendChild(clone);
      printWindow.focus();
      printWindow.print();
      setTimeout(() => printWindow.close(), 500);
    };
  }
}
