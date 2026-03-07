package com.test.devo_carre.application.port.in;

import com.test.devo_carre.application.dto.EventView;
import com.test.devo_carre.application.dto.PagedResponse;

public interface ListEventsUseCase {
    PagedResponse<EventView> listEvents(int page, int size);
}
