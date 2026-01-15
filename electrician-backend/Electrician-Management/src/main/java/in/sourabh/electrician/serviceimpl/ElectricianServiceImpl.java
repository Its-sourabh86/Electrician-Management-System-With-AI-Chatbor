package in.sourabh.electrician.serviceimpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import in.sourabh.electrician.dto.ElectricianDto;
import in.sourabh.electrician.entites.Electrician;
import in.sourabh.electrician.entites.Role;
import in.sourabh.electrician.exception.ResourceAlreadyExistsException;
import in.sourabh.electrician.exception.ResourceNotFoundException;
import in.sourabh.electrician.mapper.ElectricianMapper;
import in.sourabh.electrician.repository.ElectricianRepository;
import in.sourabh.electrician.service.ElectricianService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ElectricianServiceImpl implements ElectricianService {

    private final ElectricianRepository electricianRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    // create user
    @Override
    public ElectricianDto createElectrician(ElectricianDto electricianDto, MultipartFile image) {

        if (electricianRepository.existsByEmail(electricianDto.getEmail())) {
            throw new ResourceAlreadyExistsException(
                    "Electrician already registered with email: " + electricianDto.getEmail());
        }

        Electrician electrician = ElectricianMapper.mapToElectrician(electricianDto);
        electrician.setRole(Role.ELECTRICIAN);
        electrician.setPassword(passwordEncoder.encode(electricianDto.getPassword()));

        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService
                    .uploadImage(image, "electrician/profile");
            electrician.setImageProfile(imageUrl);
        }

        Electrician savedElectrician = electricianRepository.save(electrician);
        return ElectricianMapper.mapToElectricianDto(savedElectrician);
    }

    // get electricianBy Id
    @Override
    public ElectricianDto getElectrician(Long electricianId) {

        Electrician electrician = electricianRepository.findById(electricianId)
                .orElseThrow(() -> new ResourceNotFoundException("Electrician is Not Exist : " + electricianId));
        return ElectricianMapper.mapToElectricianDto(electrician);
    }

    // get All Electrician
    @Override
    public List<ElectricianDto> getAllElectrician() {
        List<Electrician> electrician = electricianRepository.findAll();
        return electrician.stream().map((electricians) -> ElectricianMapper.mapToElectricianDto(electricians))
                .collect(Collectors.toList());
    }

    // Update Electrician
    @Override
    public ElectricianDto updateElectrician(Long electricianId, ElectricianDto electricianDto, MultipartFile image) {

        Electrician electrician = electricianRepository.findById(electricianId)
                .orElseThrow(() -> new ResourceNotFoundException("Electrician is Not Exist : " + electricianId));

        electrician.setEmail(electricianDto.getEmail());
        electrician.setName(electricianDto.getName());
        electrician.setDegree(electricianDto.getDegree());
        electrician.setExperience(electricianDto.getExperience());
        electrician.setLocation(electricianDto.getLocation());
        // Only update imageProfile if an image is being uploaded
        // electrician.setImageProfile(electricianDto.getImageProfile()); // Remove this
        // line
        electrician.setMobileNumber(electricianDto.getMobileNumber());
        // Don't set password unconditionally - remove this line:
        // electrician.setPassword(electricianDto.getPassword());

        // Only update password if a new password is provided
        if (electricianDto.getPassword() != null && !electricianDto.getPassword().isEmpty()) {
            electrician.setPassword(passwordEncoder.encode(electricianDto.getPassword()));
        }

        // Only update image if a new image is provided
        if (image != null && !image.isEmpty()) {
            String imageurl = cloudinaryService.uploadImage(image, "electrician/profile");
            electrician.setImageProfile(imageurl);
        }

        Electrician updateElectrician = electricianRepository.save(electrician);
        return ElectricianMapper.mapToElectricianDto(updateElectrician);
    }

    // delete Electrician
    @Override
    public void deleteElectrician(Long electricianId) {
        Electrician electrician = electricianRepository.findById(electricianId)
                .orElseThrow(() -> new ResourceNotFoundException("Electrician is Not Exist : " + electricianId));

        electricianRepository.delete(electrician);
    }

}
