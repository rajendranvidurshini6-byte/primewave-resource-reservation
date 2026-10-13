'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Resource = {
  id: number;
  name: string;
  description: string | null;
  type: string;
  location: string | null;
};

type User = {
  id: number;
  name: string;
  email: string;
};

type Reservation = {
  id: number;
  startTime: string;
  endTime: string;
  userId: number;
  resourceId: number;
};

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [resourceId, setResourceId] = useState('');
  const [userId, setUserId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [filterResourceId, setFilterResourceId] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editResourceId, setEditResourceId] = useState('');
  const [editUserId, setEditUserId] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/reservations', {
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to load reservation data'
        );
      }

      setResources(data.resources || []);
      setUsers(data.users || []);
      setReservations(data.reservations || []);

      if (!userId && data.users?.length > 0) {
        setUserId(String(data.users[0].id));
      }

      if (!resourceId && data.resources?.length > 0) {
        setResourceId(String(data.resources[0].id));
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load reservation data'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function formatDateTime(value: string) {
    const normalizedValue = value.includes('T')
      ? value
      : value.replace(' ', 'T');

    const date = new Date(
      normalizedValue.endsWith('Z')
        ? normalizedValue
        : `${normalizedValue}Z`
    );

    return date.toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  function toDateTimeLocal(value: string) {
    const normalizedValue = value.includes('T')
      ? value
      : value.replace(' ', 'T');

    const date = new Date(
      normalizedValue.endsWith('Z')
        ? normalizedValue
        : `${normalizedValue}Z`
    );

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function getLocalDate(value: string) {
    const normalizedValue = value.includes('T')
      ? value
      : value.replace(' ', 'T');

    const date = new Date(
      normalizedValue.endsWith('Z')
        ? normalizedValue
        : `${normalizedValue}Z`
    );

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function getResource(id: number) {
    return resources.find((resource) => resource.id === id);
  }

  function getUser(id: number) {
    return users.find((user) => user.id === id);
  }

  async function handleCreateReservation(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!resourceId || !userId || !startTime || !endTime) {
      setError('Please complete all reservation fields.');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      setError('Please enter a valid date and time.');
      return;
    }

    if (start >= end) {
      setError('End time must be after the start time.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: Number(resourceId),
          userId: Number(userId),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || 'Unable to create reservation.'
        );
        return;
      }

      setSuccess('Reservation created successfully.');

      setStartTime('');
      setEndTime('');

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create reservation.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(reservation: Reservation) {
    setError('');
    setSuccess('');

    setEditingId(reservation.id);
    setEditResourceId(String(reservation.resourceId));
    setEditUserId(String(reservation.userId));
    setEditStartTime(
      toDateTimeLocal(reservation.startTime)
    );
    setEditEndTime(
      toDateTimeLocal(reservation.endTime)
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditResourceId('');
    setEditUserId('');
    setEditStartTime('');
    setEditEndTime('');
  }

  async function handleUpdateReservation(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (editingId === null) {
      return;
    }

    setError('');
    setSuccess('');

    if (
      !editResourceId ||
      !editUserId ||
      !editStartTime ||
      !editEndTime
    ) {
      setError('Please complete all edit fields.');
      return;
    }

    const start = new Date(editStartTime);
    const end = new Date(editEndTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      setError('Please enter a valid date and time.');
      return;
    }

    if (start >= end) {
      setError('End time must be after the start time.');
      return;
    }

    try {
      setUpdatingId(editingId);

      const response = await fetch('/api/reservations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingId,
          resourceId: Number(editResourceId),
          userId: Number(editUserId),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || 'Unable to update reservation.'
        );
        return;
      }

      setSuccess('Reservation updated successfully.');

      cancelEditing();

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update reservation.'
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteReservation(
    reservationId: number
  ) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this reservation?'
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccess('');
    setDeletingId(reservationId);

    try {
      const response = await fetch('/api/reservations', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: reservationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || 'Unable to delete reservation.'
        );
        return;
      }

      setSuccess('Reservation deleted successfully.');

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete reservation.'
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredReservations = useMemo(() => {
    return [...reservations]
      .filter((reservation) => {
        if (!filterResourceId) {
          return true;
        }

        return (
          reservation.resourceId === Number(filterResourceId)
        );
      })
      .filter((reservation) => {
        if (!filterDate) {
          return true;
        }

        return (
          getLocalDate(reservation.startTime) === filterDate
        );
      })
      .sort(
        (a, b) =>
          new Date(
            a.startTime.replace(' ', 'T') + 'Z'
          ).getTime() -
          new Date(
            b.startTime.replace(' ', 'T') + 'Z'
          ).getTime()
      );
  }, [
    reservations,
    filterResourceId,
    filterDate,
  ]);

  const selectedFilterResource = filterResourceId
    ? getResource(Number(filterResourceId))
    : null;

  const availabilityText =
    filterResourceId || filterDate
      ? `${filteredReservations.length} reservation${
          filteredReservations.length === 1
            ? ''
            : 's'
        } found${
          selectedFilterResource
            ? ` for ${selectedFilterResource.name}`
            : ''
        }.`
      : 'Showing all reservations.';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
            Resource Reservation Management
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Resource Reservation System
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Reserve shared resources, prevent scheduling
            conflicts, and manage availability.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <strong className="font-semibold">
              Reservation could not be completed
            </strong>

            <p className="mt-1">{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Reservation Form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {editingId !== null
                  ? 'Edit Reservation'
                  : 'Create Reservation'}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingId !== null
                  ? 'Update the reservation details. Conflict checking still applies.'
                  : 'Select a resource and reserve it for a specific time.'}
              </p>
            </div>

            {editingId !== null ? (
              <form
                onSubmit={handleUpdateReservation}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="editResource"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Resource
                  </label>

                  <select
                    id="editResource"
                    value={editResourceId}
                    onChange={(event) =>
                      setEditResourceId(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">
                      Select a resource
                    </option>

                    {resources.map((resource) => (
                      <option
                        key={resource.id}
                        value={resource.id}
                      >
                        {resource.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="editUser"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    User
                  </label>

                  <select
                    id="editUser"
                    value={editUserId}
                    onChange={(event) =>
                      setEditUserId(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">
                      Select a user
                    </option>

                    {users.map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.name} — {user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="editStartTime"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Start time
                  </label>

                  <input
                    id="editStartTime"
                    type="datetime-local"
                    value={editStartTime}
                    onChange={(event) =>
                      setEditStartTime(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="editEndTime"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    End time
                  </label>

                  <input
                    id="editEndTime"
                    type="datetime-local"
                    value={editEndTime}
                    onChange={(event) =>
                      setEditEndTime(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="submit"
                    disabled={updatingId === editingId}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingId === editingId
                      ? 'Updating...'
                      : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleCreateReservation}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="resource"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Resource
                  </label>

                  <select
                    id="resource"
                    value={resourceId}
                    onChange={(event) =>
                      setResourceId(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">
                      Select a resource
                    </option>

                    {resources.map((resource) => (
                      <option
                        key={resource.id}
                        value={resource.id}
                      >
                        {resource.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="user"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    User
                  </label>

                  <select
                    id="user"
                    value={userId}
                    onChange={(event) =>
                      setUserId(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">
                      Select a user
                    </option>

                    {users.map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.name} — {user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="startTime"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Start time
                  </label>

                  <input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(event) =>
                      setStartTime(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endTime"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    End time
                  </label>

                  <input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(event) =>
                      setEndTime(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? 'Creating...'
                    : 'Create Reservation'}
                </button>
              </form>
            )}
          </section>

          {/* Availability */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                Availability
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Filter reservations by resource and date.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="filterResource"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Resource
                  </label>

                  <select
                    id="filterResource"
                    value={filterResourceId}
                    onChange={(event) =>
                      setFilterResourceId(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="">
                      All resources
                    </option>

                    {resources.map((resource) => (
                      <option
                        key={resource.id}
                        value={resource.id}
                      >
                        {resource.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="filterDate"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Date
                  </label>

                  <input
                    id="filterDate"
                    type="date"
                    value={filterDate}
                    onChange={(event) =>
                      setFilterDate(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterResourceId('');
                      setFilterDate('');
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-100"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Resources
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {resources.length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Reservations
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {filteredReservations.length}
                </p>
              </div>

              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-xs uppercase tracking-wide text-green-700">
                  Status
                </p>

                <p className="mt-1 font-semibold text-green-800">
                  {filteredReservations.length === 0
                    ? 'Available'
                    : 'Has reservations'}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-4">
                <h3 className="font-semibold">
                  Reservation Schedule
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {availabilityText}
                </p>
              </div>

              {loading ? (
                <div className="rounded-xl border p-8 text-center text-sm text-slate-500">
                  Loading reservations...
                </div>
              ) : filteredReservations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-green-300 bg-green-50 p-8 text-center">
                  <p className="font-semibold text-green-800">
                    No reservations found
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    The selected resource is available.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReservations.map(
                    (reservation) => {
                      const resource = getResource(
                        reservation.resourceId
                      );

                      const user = getUser(
                        reservation.userId
                      );

                      return (
                        <div
                          key={reservation.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-semibold">
                                  {resource?.name ||
                                    'Unknown Resource'}
                                </h4>

                                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                  Reserved
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-slate-600">
                                {formatDateTime(
                                  reservation.startTime
                                )}{' '}
                                →{' '}
                                {formatDateTime(
                                  reservation.endTime
                                )}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                Reserved by:{' '}
                                <span className="font-medium text-slate-700">
                                  {user?.name ||
                                    'Unknown User'}
                                </span>
                              </p>
                            </div>

                            <div className="flex w-full gap-2 sm:w-auto">
                              <button
                                type="button"
                                onClick={() =>
                                  startEditing(reservation)
                                }
                                className="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 sm:flex-none"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteReservation(
                                    reservation.id
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  reservation.id
                                }
                                className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                              >
                                {deletingId ===
                                reservation.id
                                  ? 'Deleting...'
                                  : 'Delete'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Resources */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Available Resources
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Resources currently registered in the system.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <h3 className="font-semibold">
                  {resource.name}
                </h3>

                <p className="mt-1 text-xs font-medium uppercase text-blue-600">
                  {resource.type}
                </p>

                {resource.description && (
                  <p className="mt-3 text-sm text-slate-600">
                    {resource.description}
                  </p>
                )}

                {resource.location && (
                  <p className="mt-3 text-xs text-slate-500">
                    Location: {resource.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}