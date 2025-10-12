<script lang="ts">
  export let status: string;

  const statusMap: Record<
    string,
    { label: string; class: string }
  > = {
    NEW: { label: "Nowy", class: "badge-info" },
    QUALIFIED: { label: "Zakwalifikowany", class: "badge-primary" },
    ACTIVE: { label: "Aktywny", class: "badge-success" },
    INACTIVE: { label: "Nieaktywny", class: "badge-ghost" },
    // Visit statuses
    PLANNED: { label: "Zaplanowana", class: "badge-warning" },
    DONE: { label: "Wykonana", class: "badge-success" },
    CANCELLED: { label: "Anulowana", class: "badge-error" },
    NO_SHOW: { label: "Nie pojawił się", class: "badge-error" },
    // Activity outcomes
    NO_ANSWER: { label: "Brak odpowiedzi", class: "badge-ghost" },
    MEETING_SET: { label: "Umówiono wizytę", class: "badge-success" },
    ORDER_TAKEN: { label: "Zamówienie", class: "badge-success" },
    INFO_SENT: { label: "Wysłano info", class: "badge-info" },
    OFFER_PRESENTED: { label: "Oferta", class: "badge-primary" },
    POST_DELIVERY_CHECK: { label: "Kontrola po dostawie", class: "badge-accent" },
  };

  $: statusInfo = statusMap[status] || { label: status, class: "badge-ghost" };
</script>

<span class="badge {statusInfo.class}">
  {statusInfo.label}
</span>
