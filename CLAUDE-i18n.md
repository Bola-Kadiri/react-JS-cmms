# CLAUDE-i18n.md — AlphaCMMS Internationalisation Guide

> **Read this before touching any i18n work.** It is the authoritative reference for
> translating AlphaCMMS components without breaking existing code.
>
> Last audited: 2026-06-14

---

## 1. Infrastructure Overview

| File | Purpose |
|---|---|
| `src/i18n.ts` | Initialises i18next. Imports every locale JSON and registers them. Edit here when adding a new namespace. |
| `src/types/i18n.ts` | TypeScript union type `TranslationNamespaces`. Must stay in sync with `src/i18n.ts`. |
| `src/hooks/useTypedTranslation.ts` | Custom hook wrapping `useTranslation`. Always use this — never call `useTranslation` directly. |
| `src/locales/en/<ns>.json` | English strings for namespace `<ns>` |
| `src/locales/fr/<ns>.json` | French strings for namespace `<ns>` — **must always be updated together with the en file** |

### Hook Signature

```ts
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

// Inside a component function body:
const { t } = useTypedTranslation('facility');  // single namespace
```

### Cross-Namespace Reference

To use a key from a different namespace, prefix it:

```ts
t('common:actions.cancel')    // uses common.json → actions.cancel
t('common:confirmation.deleteTitle')
```

### Language Detection

Language is read from `localStorage.preferredLanguage`. The `LanguageSwitcher` component writes to this key. Fallback is `'en'`.

---

## 2. Registered Namespaces → Feature Module Mapping

| Namespace | `src/features/` path | `src/locales/en/<ns>.json` top-level keys |
|---|---|---|
| `common` | Shared across all modules | `actions`, `status`, `confirmation`, `table`, `filter`, `currency` |
| `auth` | `src/components/auth/` | `login`, `register`, `validation` |
| `dashboard` | `src/components/dashboard/` | `overview`, `metrics`, `widgets` |
| `sidebar` | `src/components/dashboard/Sidebar.tsx` | `nav`, `modules` |
| `assets` | `src/features/asset/` | `assetCategory`, `assetSubcategory`, `inventoryType`, `inventoryRef`, `inventoryForm`, `inventoryDetail`, `manufacturer`, `model`, `store`, `transfer`, `warehouse`, `item`, `itemRequest` |
| `facility` | `src/features/facility/` | `facility`, `building`, `region`, `cluster`, `subsystem`, `zone`, `landlord`, `apartment`, `apartmentType` |
| `accounts` | `src/features/reference/` | `user`, `personnel`, `client`, `vendor`, `department`, `category`, `subcategory`, `bankAccount`, `unitMeasurement`, `warehouse`, `store`, `item`, `itemRequest`, `inventory`, `transfer`, `assetCategory`, `assetSubcategory`, `inventoryType`, `manufacturer`, `model`, `inventoryReference` |
| `work` | `src/features/work/` | `workrequest`, `workorder`, `completion`, `ppm`, `ppmItem`, `invoiceItem`, `paymentComment`, `paymentItem`, `paymentRequisition` |
| `procurement` | `src/features/procurement/` | `goodsReceivedNote`, `poRequisition`, `purchaseOrder`, `requestQuotation`, `vendorContract` |
| `tables` | Shared table component | Table-specific strings |
| `form` | Shared form component | Form-specific strings |

> **No `reference` namespace exists.** The `src/features/reference/` module uses the `accounts` namespace. Do not create a `reference` namespace.

> **`accounts.json` already contains all the keys** for every entity in `src/features/reference/`. Components just need to import `useTypedTranslation('accounts')` and wire up the keys.

---

## 3. The Four-Step Pattern (apply to every untranslated component)

### Step 1 — Add the hook import

```ts
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
```

### Step 2 — Call the hook as the **first line** of the component function

```ts
const ComponentName = () => {
  const { t } = useTypedTranslation('facility');   // ← first line
  // ... rest of the component
```

### Step 3 — Replace every hardcoded user-visible string with `t(...)`

```tsx
// Before
<h1>Region Management</h1>
<p>Loading regions...</p>
<Button>Add Region</Button>

// After
<h1>{t('region.management')}</h1>
<p>{t('region.loading')}</p>
<Button>{t('region.add')}</Button>
```

### Step 4 — Update both locale files

Edit `src/locales/en/<ns>.json` AND `src/locales/fr/<ns>.json` together.
Never add a key to one without adding it to the other.

```json
// en/facility.json — add under "region":
"newKey": "English text"

// fr/facility.json — matching path:
"newKey": "French text"
```

---

## 4. Critical Rules (Do Not Break These)

### Rule 1 — Zod Schemas Must Live Inside the Component Body

Any Zod schema whose `.min()` / `.required()` messages will be translated **must be defined inside the component function**, after the `t` hook call. If defined at module level, the schema is created before translation is available and the messages will always appear in English regardless of language.

```ts
// WRONG — module level, breaks translation
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

const MyForm = () => { ... }

// CORRECT — inside component, after t hook
const MyForm = () => {
  const { t } = useTypedTranslation('facility');

  const formSchema = z.object({
    name: z.string().min(1, t('region.form.validation.nameRequired')),
  });

  // ... rest of the form
}
```

### Rule 2 — SelectItem `value` Props Are Never Translated

The `value` prop holds the raw backend string sent to the API. Only the **display text** (child content) is translated.

```tsx
// CORRECT
<SelectItem value="Active">{t('common:filter.active')}</SelectItem>
<SelectItem value="Inactive">{t('common:filter.inactive')}</SelectItem>

// WRONG — would break API calls
<SelectItem value={t('filter.active')}>{t('filter.active')}</SelectItem>
```

### Rule 3 — Always Update Both Locale Files

`en` and `fr` must always be updated together. The French value can be a placeholder copy of English temporarily, but the key must exist in both files or i18next will log a warning.

### Rule 4 — Use `common:` Prefix for Shared Strings

Strings that appear identically across many modules belong in `common.json` and should be referenced with the namespace prefix:

```ts
t('common:actions.cancel')
t('common:actions.save')
t('common:status.loading')
t('common:confirmation.delete')
```

Do not duplicate these strings into module-specific namespace files.

### Rule 5 — Never Call `useTranslation` Directly

Always use `useTypedTranslation`. It provides the TypedTFunction wrapper and the `changeLanguage` helper.

---

## 5. Adding a New Namespace (if ever required)

1. Create `src/locales/en/<name>.json`
2. Create `src/locales/fr/<name>.json`
3. Add imports and resource entries to `src/i18n.ts`:
   ```ts
   import en<Name> from './locales/en/<name>.json';
   import fr<Name> from './locales/fr/<name>.json';
   // ... inside resources:
   en: { ..., <name>: en<Name> }
   fr: { ..., <name>: fr<Name> }
   ```
4. Add `'<name>'` to `TranslationNamespaces` union in `src/types/i18n.ts`
5. Add `'<name>:${string}'` entry to `TranslationKeys` union in `src/types/i18n.ts`

---

## 6. Current Translation Status

### ✅ Fully Translated (has `useTypedTranslation`)

**asset module** (`namespace: 'assets'`)
- [x] `src/features/asset/asset/AssetDetailView.tsx`
- [x] `src/features/asset/asset/AssetForm.tsx`
- [x] `src/features/asset/asset/AssetManagement.tsx`
- [x] `src/features/asset/assetcategory/AssetCategoryDetailView.tsx`
- [x] `src/features/asset/assetcategory/AssetCategoryForm.tsx`
- [x] `src/features/asset/assetcategory/AssetCategoryManagement.tsx`
- [x] `src/features/asset/assetsubcategory/AssetSubcategoryDetailView.tsx`
- [x] `src/features/asset/assetsubcategory/AssetSubcategoryForm.tsx`
- [x] `src/features/asset/assetsubcategory/AssetSubcategoryManagement.tsx`
- [x] `src/features/asset/inventory-reference/InventoryReferenceDetailView.tsx`
- [x] `src/features/asset/inventory-reference/InventoryReferenceForm.tsx`
- [x] `src/features/asset/inventory-reference/InventoryReferenceManagement.tsx`
- [x] `src/features/asset/inventory/InventoryDetailView.tsx`
- [x] `src/features/asset/inventory/InventoryForm.tsx`
- [x] `src/features/asset/inventorytype/InventoryTypeDetailView.tsx`
- [x] `src/features/asset/inventorytype/InventoryTypeForm.tsx`
- [x] `src/features/asset/inventorytype/InventoryTypeManagement.tsx`
- [x] `src/features/asset/manufacturer/ManufacturerDetailView.tsx`
- [x] `src/features/asset/manufacturer/ManufacturerForm.tsx`
- [x] `src/features/asset/manufacturer/ManufacturerManagement.tsx`
- [x] `src/features/asset/model/ModelDetailView.tsx`
- [x] `src/features/asset/model/ModelForm.tsx`
- [x] `src/features/asset/model/ModelManagement.tsx`
- [x] `src/features/asset/stores/StoreDetailView.tsx`
- [x] `src/features/asset/stores/StoreForm.tsx`
- [x] `src/features/asset/stores/StoreManagement.tsx`
- [x] `src/features/asset/transfer/TransferManagement.tsx`

**calendar module** (`namespace: 'work'` — same namespace as work module)
- [x] `src/features/calendar/CalendarEventsManagement.tsx`
- [x] `src/features/calendar/PPMCalendarDetailView.tsx`
- [x] `src/features/calendar/PPMCalendarManagement.tsx`

**facility module** (`namespace: 'facility'`) — ALL 27 files done
- [x] `src/features/facility/apartments/ApartmentDetailView.tsx`
- [x] `src/features/facility/apartments/ApartmentForm.tsx`
- [x] `src/features/facility/apartments/ApartmentManagement.tsx`
- [x] `src/features/facility/apartmenttypes/ApartmenttypeDetailView.tsx`
- [x] `src/features/facility/apartmenttypes/ApartmenttypeForm.tsx`
- [x] `src/features/facility/apartmenttypes/ApartmenttypeManagement.tsx`
- [x] `src/features/facility/buildings/BuidlingDetailView.tsx`
- [x] `src/features/facility/buildings/BuildingForm.tsx`
- [x] `src/features/facility/buildings/BuildingManagement.tsx`
- [x] `src/features/facility/clusters/ClusterDetailView.tsx`
- [x] `src/features/facility/clusters/ClusterForm.tsx`
- [x] `src/features/facility/clusters/ClusterManagement.tsx`
- [x] `src/features/facility/facilities/FacilityDetailView.tsx`
- [x] `src/features/facility/facilities/FacilityForm.tsx`
- [x] `src/features/facility/facilities/FacilityManagement.tsx`
- [x] `src/features/facility/landlords/LandlordDetailView.tsx`
- [x] `src/features/facility/landlords/LandlordForm.tsx`
- [x] `src/features/facility/landlords/LandlordManagement.tsx`
- [x] `src/features/facility/regions/RegionDetailView.tsx`
- [x] `src/features/facility/regions/RegionForm.tsx`
- [x] `src/features/facility/regions/RegionManagement.tsx`
- [x] `src/features/facility/subsystems/SubsystemDetailView.tsx`
- [x] `src/features/facility/subsystems/SubsystemForm.tsx`
- [x] `src/features/facility/subsystems/SubsystemManagement.tsx`
- [x] `src/features/facility/zones/ZoneDetailView.tsx`
- [x] `src/features/facility/zones/ZoneForm.tsx`
- [x] `src/features/facility/zones/ZoneManagement.tsx`

**procurement module — Management files only** (`namespace: 'procurement'`)
- [x] `src/features/procurement/goodsreceivednotes/GoodsreceivednoteManagement.tsx`
- [x] `src/features/procurement/porequisitions/PorequisitionManagement.tsx`
- [x] `src/features/procurement/purchaseorders/PurchaseorderManagement.tsx`
- [x] `src/features/procurement/requestquotations/RequestquotationManagement.tsx`
- [x] `src/features/procurement/vendorcontracts/VendorcontractManagement.tsx`

**work module** (`namespace: 'work'`)
- [x] `src/features/work/invoiceitems/InvoiceitemManagement.tsx`
- [x] `src/features/work/paymentcomments/PaymentcommentManagement.tsx`
- [x] `src/features/work/paymentitems/PaymentitemManagement.tsx`
- [x] `src/features/work/paymentrequisitions/PaymentrequisitionManagement.tsx`
- [x] `src/features/work/ppmitems/PpmitemManagement.tsx`
- [x] `src/features/work/ppms/PpmDetailView.tsx`
- [x] `src/features/work/ppms/PpmForm.tsx`
- [x] `src/features/work/ppms/PpmManagement.tsx`
- [x] `src/features/work/work-order-completions/WorkordercompletionForm.tsx`
- [x] `src/features/work/work-order-completions/WorkordercompletionManagement.tsx`
- [x] `src/features/work/workorders/WorkorderForm.tsx`
- [x] `src/features/work/workorders/WorkorderManagement.tsx`
- [x] `src/features/work/workrequests/WorkrequestForm.tsx`
- [x] `src/features/work/workrequests/WorkrequestManagement.tsx`

**components**
- [x] `src/components/auth/SignInForm.tsx`
- [x] `src/components/auth/LogoutButton.tsx`
- [x] `src/components/dashboard/Sidebar.tsx`
- [x] `src/components/LanguageSwitcher.tsx`

---

### ❌ Not Yet Translated

**asset module** — remaining files (`namespace: 'assets'`)

| File | Locale key prefix |
|---|---|
| `src/features/asset/inventory/InventoryManagement.tsx` | `assets:inventoryForm.*` |
| `src/features/asset/transfer/TransferDetailView.tsx` | `assets:transfer.*` |
| `src/features/asset/transfer/TransferForm.tsx` | `assets:transfer.form.*` |
| `src/features/asset/warehouses/WarehouseDetailView.tsx` | `assets:warehouse.*` |
| `src/features/asset/warehouses/WarehouseForm.tsx` | `assets:warehouse.form.*` |
| `src/features/asset/warehouses/WarehouseManagement.tsx` | `assets:warehouse.*` |
| `src/features/asset/items/ItemDetailView.tsx` | `assets:item.*` |
| `src/features/asset/items/ItemForm.tsx` | `assets:item.form.*` |
| `src/features/asset/items/ItemManagement.tsx` | `assets:item.*` |
| `src/features/asset/itemrequest/ItemRequestDetailView.tsx` | `assets:itemRequest.*` |
| `src/features/asset/itemrequest/ItemRequestForm.tsx` | `assets:itemRequest.form.*` |
| `src/features/asset/itemrequest/ItemRequestManagement.tsx` | `assets:itemRequest.*` |

**reference module — ALL 27 files** (`namespace: 'accounts'`)

The locale keys already exist in `src/locales/en/accounts.json` and `src/locales/fr/accounts.json`.
Components just need `useTypedTranslation('accounts')` and the keys wired in.

| File | Locale key prefix |
|---|---|
| `src/features/reference/users/UserDetailView.tsx` | `accounts:user.*` |
| `src/features/reference/users/UserForm.tsx` | `accounts:user.form.*` |
| `src/features/reference/users/UserManagement.tsx` | `accounts:user.*` |
| `src/features/reference/vendors/VendorDetailView.tsx` | `accounts:vendor.*` |
| `src/features/reference/vendors/VendorForm.tsx` | `accounts:vendor.form.*` |
| `src/features/reference/vendors/VendorManagement.tsx` | `accounts:vendor.*` |
| `src/features/reference/clients/ClientDetailView.tsx` | `accounts:client.*` |
| `src/features/reference/clients/ClientForm.tsx` | `accounts:client.form.*` |
| `src/features/reference/clients/ClientManagement.tsx` | `accounts:client.*` |
| `src/features/reference/departments/DepartmentDetailView.tsx` | `accounts:department.*` |
| `src/features/reference/departments/DepartmentForm.tsx` | `accounts:department.form.*` |
| `src/features/reference/departments/DepartmentManagement.tsx` | `accounts:department.*` |
| `src/features/reference/categories/CategoryDetailView.tsx` | `accounts:category.*` |
| `src/features/reference/categories/CategoryForm.tsx` | `accounts:category.form.*` |
| `src/features/reference/categories/CategoryManagement.tsx` | `accounts:category.*` |
| `src/features/reference/subcategories/SubcategoryDetailView.tsx` | `accounts:subcategory.*` |
| `src/features/reference/subcategories/SubcategoryForm.tsx` | `accounts:subcategory.form.*` |
| `src/features/reference/subcategories/SubcategoryManagement.tsx` | `accounts:subcategory.*` |
| `src/features/reference/personnels/PersonnelDetailView.tsx` | `accounts:personnel.*` |
| `src/features/reference/personnels/PersonnelForm.tsx` | `accounts:personnel.form.*` |
| `src/features/reference/personnels/PersonnelManagement.tsx` | `accounts:personnel.*` |
| `src/features/reference/unitmeasurements/UnitmeasurementDetailView.tsx` | `accounts:unitMeasurement.*` |
| `src/features/reference/unitmeasurements/UnitmeasurementForm.tsx` | `accounts:unitMeasurement.form.*` |
| `src/features/reference/unitmeasurements/UnitmeasurementManagement.tsx` | `accounts:unitMeasurement.*` |
| `src/features/reference/bankaccounts/BankaccountDetailView.tsx` | `accounts:bankAccount.*` |
| `src/features/reference/bankaccounts/BankaccountForm.tsx` | `accounts:bankAccount.form.*` |
| `src/features/reference/bankaccounts/BankaccountManagement.tsx` | `accounts:bankAccount.*` |

**procurement module — Detail/Form files** (`namespace: 'procurement'`)

| File | Notes |
|---|---|
| `src/features/procurement/goodsreceivednotes/GoodsreceivednoteDetailView.tsx` | |
| `src/features/procurement/goodsreceivednotes/GoodsreceivednoteForm.tsx` | Check for Zod schema at module level |
| `src/features/procurement/porequisitions/PorequisitionDetailView.tsx` | Active file; ignore `-new.tsx` and `-old.tsx` |
| `src/features/procurement/porequisitions/PorequisitionForm.tsx` | Active file; ignore `PorequisitionForm-old.tsx` |
| `src/features/procurement/purchaseorders/PurchaseorderDetailView.tsx` | |
| `src/features/procurement/purchaseorders/PurchaseorderForm.tsx` | Check for Zod schema at module level |
| `src/features/procurement/requestquotations/RequestquotationDetailView.tsx` | |
| `src/features/procurement/requestquotations/RequestquotationForm.tsx` | Check for Zod schema at module level |
| `src/features/procurement/vendorcontracts/VendorcontractDetailView.tsx` | |
| `src/features/procurement/vendorcontracts/VendorcontractForm.tsx` | Check for Zod schema at module level |

**work module — Detail/Form/Print files** (`namespace: 'work'`)

| File | Notes |
|---|---|
| `src/features/work/invoiceitems/InvoiceitemDetailView.tsx` | |
| `src/features/work/invoiceitems/InvoiceitemForm.tsx` | Check for Zod schema at module level |
| `src/features/work/invoiceitems/InvoiceitemPrintView.tsx` | |
| `src/features/work/paymentcomments/PaymentcommentDetailView.tsx` | |
| `src/features/work/paymentcomments/PaymentcommentForm.tsx` | Check for Zod schema at module level |
| `src/features/work/paymentitems/PaymentitemDetailView.tsx` | |
| `src/features/work/paymentitems/PaymentitemForm.tsx` | Check for Zod schema at module level |
| `src/features/work/paymentrequisitions/PaymentrequisitionDetailView.tsx` | |
| `src/features/work/paymentrequisitions/PaymentrequisitionForm.tsx` | Check for Zod schema at module level |
| `src/features/work/ppmitems/PpmitemDetailView.tsx` | |
| `src/features/work/ppmitems/PpmitemForm.tsx` | Check for Zod schema at module level |
| `src/features/work/work-order-completions/WorkordercompletionDetailView.tsx` | |
| `src/features/work/workrequests/WorkrequestDetailView.tsx` | |

---

## 7. Quick Reference: Common Key Patterns

Every entity follows this consistent structure in its locale file:

```json
"<entity>": {
  "management": "Entity Management",
  "add": "Add Entity",
  "loading": "Loading entities...",
  "error": "Error loading entities",
  "noItems": "No entities found",
  "deleteTitle": "Delete Entity",
  "deleteMessage": "This action cannot be undone. This will permanently delete this entity.",
  "searchPlaceholder": "Search...",
  "columns": {
    "name": "Name",
    "status": "Status",
    "actions": "Actions"
  },
  "delete": {
    "title": "Are you sure?",
    "message": "...",
    "cancel": "Cancel",
    "confirm": "Delete",
    "deleting": "Deleting..."
  },
  "form": {
    "createTitle": "Create New Entity",
    "editTitle": "Edit Entity",
    "name": "Name",
    "namePlaceholder": "...",
    "cancel": "Cancel",
    "save": "Save",
    "update": "Update",
    "loading": "Loading entity details...",
    "error": "Error loading entity details",
    "validation": {
      "nameRequired": "Name is required"
    }
  },
  "detail": {
    "title": "Entity Details",
    "editButton": "Edit Entity",
    "backButton": "Back to Entities",
    "loading": "Loading entity details...",
    "error": "Error loading entity details",
    "notFound": "Entity not found"
  }
}
```

---

## 8. Frequently Reused `common` Strings

These already exist in `src/locales/en/common.json`. Use them instead of re-adding to module namespaces:

```ts
t('common:actions.create')          // "Create"
t('common:actions.update')          // "Update"
t('common:actions.delete')          // "Delete"
t('common:actions.cancel')          // "Cancel"
t('common:actions.save')            // "Save"
t('common:actions.back')            // "Back"
t('common:actions.edit')            // "Edit"
t('common:actions.view')            // "View"
t('common:actions.add')             // "Add"
t('common:actions.tryAgain')        // "Try Again"
t('common:actions.confirm')         // "Confirm"
t('common:status.loading')          // "Loading..."
t('common:status.error')            // "Error"
t('common:status.deleting')         // "Deleting..."
t('common:confirmation.delete')     // "Are you sure you want to delete this item?"
t('common:confirmation.deleteTitle')// "Delete Item"
t('common:table.noResults')         // "No items found"
t('common:filter.allStatuses')      // "All Statuses"
t('common:filter.allTypes')         // "All Types"
t('common:search')                  // "Search..."
t('common:notSet')                  // "Not set"
t('common:na')                      // "N/A"
```

---

## 9. Files to Ignore

These files should NOT be translated (they are stale alternates or archive copies):

- `src/features/procurement/porequisitions/PorequisitionDetailView-new.tsx`
- `src/features/procurement/porequisitions/PorequisitionDetailView-old.tsx`
- `src/features/procurement/porequisitions/PorequisitionForm-old.tsx`

---

## 10. Verification Checklist Per File

After translating any component, verify:

- [ ] `useTypedTranslation('<namespace>')` called as first line of the component function
- [ ] All user-visible strings replaced with `t(...)` calls
- [ ] Zod schemas with translated error messages are **inside** the component, after the `t` call
- [ ] `<SelectItem value="...">` raw backend values unchanged; only child text translated
- [ ] Matching key added to both `en/<ns>.json` and `fr/<ns>.json`
- [ ] No new string in a module file that already exists in `common.json` — use `t('common:...')` instead
- [ ] TypeScript compiles without errors (run `tsc --noEmit`)

---

*End of CLAUDE-i18n.md*
