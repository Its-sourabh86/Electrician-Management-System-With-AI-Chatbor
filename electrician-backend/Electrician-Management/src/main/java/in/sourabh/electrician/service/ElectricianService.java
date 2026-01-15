package in.sourabh.electrician.service;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import in.sourabh.electrician.dto.ElectricianDto;
public interface ElectricianService {

    ElectricianDto createElectrician(ElectricianDto electricianDto,MultipartFile image);
    ElectricianDto getElectrician(Long electricianId);
    List<ElectricianDto> getAllElectrician();
    ElectricianDto updateElectrician(Long electricianId,ElectricianDto electricianDto,MultipartFile image);
    void deleteElectrician(Long electricianId);

}
